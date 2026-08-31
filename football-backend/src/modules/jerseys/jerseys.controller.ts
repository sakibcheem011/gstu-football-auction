import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { uploadFromBuffer, deleteFromCloudinary } from '../../lib/cloudinary';
import jwt from 'jsonwebtoken';

export const uploadJersey = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    if (user.role !== 'PLAYER') {
      return res.status(403).json({ error: 'Only players can upload jerseys' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id as string } });
    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    const playerRecord = await prisma.player.findUnique({ where: { email: dbUser.email } });
    if (!playerRecord) return res.status(404).json({ error: 'Player record not found' });

    const existingJerseysCount = await prisma.jerseyDesign.count({ where: { playerId: playerRecord.id } });
    if (existingJerseysCount >= 3) {
      return res.status(400).json({ error: 'You can only upload a maximum of 3 jersey designs.' });
    }

    const uploadResult = await uploadFromBuffer(req.file.buffer, 'gstu_liga_jerseys');
    
    const jersey = await prisma.jerseyDesign.create({
      data: {
        playerId: playerRecord.id,
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id
      }
    });

    return res.status(201).json(jersey);
  } catch (error: any) {
    console.error('Upload jersey error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJerseys = async (req: Request, res: Response): Promise<any> => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
    
    // Check auth to see if user is SUPER_ADMIN
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        if (decoded.role === 'SUPER_ADMIN') isAdmin = true;
      } catch (e) {
        // ignore
      }
    }

    if (!config?.jerseyVotingOpen && !isAdmin) {
      return res.status(403).json({ error: 'Voting and showcase are currently closed by the Admin.' });
    }

    const jerseys = await prisma.jerseyDesign.findMany({
      include: {
        player: {
          select: {
            name: true,
            studentId: true,
            sessionId: true,
            jerseyName: true,
            team: {
              select: {
                name: true
              }
            }
          }
        },
        votes: {
          select: {
            playerId: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: [
        { votes: { _count: 'desc' } },
        { createdAt: 'desc' }
      ]
    });
    return res.json(jerseys);
  } catch (error) {
    console.error('Get jerseys error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteJersey = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const jersey = await prisma.jerseyDesign.findUnique({ where: { id: id as string }, include: { player: true } });
    if (!jersey) return res.status(404).json({ error: 'Jersey not found' });

    if (user.role === 'PLAYER') {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id as string } });
      if (jersey.player.email !== dbUser?.email) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } else if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (jersey.imagePublicId) {
      await deleteFromCloudinary(jersey.imagePublicId);
    }
    await prisma.jerseyDesign.delete({ where: { id: id as string } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete jersey error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleVote = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    if (user.role !== 'PLAYER') {
      return res.status(403).json({ error: 'Only players can vote' });
    }

    const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
    if (!config?.jerseyVotingOpen) {
      return res.status(403).json({ error: 'Voting is currently closed by the Admin.' });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id as string } });
    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    const playerRecord = await prisma.player.findUnique({ where: { email: dbUser.email } });
    if (!playerRecord) return res.status(404).json({ error: 'Player record not found' });

    const { id: jerseyDesignId } = req.params;

    const existingVote = await prisma.jerseyVote.findUnique({
      where: {
        playerId_jerseyDesignId: {
          playerId: playerRecord.id,
          jerseyDesignId: jerseyDesignId as string
        }
      }
    });

    if (existingVote) {
      await prisma.jerseyVote.delete({ where: { id: existingVote.id } });
      return res.json({ message: 'Vote removed' });
    } else {
      const currentVotes = await prisma.jerseyVote.count({ where: { playerId: playerRecord.id } });
      if (currentVotes >= 5) {
        return res.status(400).json({ error: 'You can only vote for up to 5 jerseys' });
      }
      await prisma.jerseyVote.create({
        data: {
          playerId: playerRecord.id,
          jerseyDesignId: jerseyDesignId as string
        }
      });
      return res.json({ message: 'Vote added' });
    }
  } catch (error: any) {
    console.error('Toggle vote error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};