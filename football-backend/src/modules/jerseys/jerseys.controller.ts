import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { uploadFromBuffer, deleteFromCloudinary } from '../../lib/cloudinary';

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
    const jerseys = await prisma.jerseyDesign.findMany({
      include: {
        player: {
          select: {
            name: true,
            studentId: true,
            sessionId: true,
            jerseyName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
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