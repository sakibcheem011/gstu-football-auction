import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { uploadFromBuffer } from '../../lib/cloudinary';
import { ioInstance } from '../../sockets';
import { recalculateRosterLimits } from '../rules/rules.controller';

export const registerPlayer = async (req: Request, res: Response): Promise<any> => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
    if (config?.currentPhase !== 'REGISTRATION') {
      return res.status(403).json({ error: 'Player registration is currently closed.' });
    }

    const { name, email, studentId, sessionId, jerseyName, jerseyNumber, positions } = req.body;
    
    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (req.file) {
      // Upload to Cloudinary
      const uploadResult = await uploadFromBuffer(req.file.buffer, 'gstu_liga_players');
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    let parsedPositions = [];
    try {
      parsedPositions = JSON.parse(positions); // Array of { position: string, isPrimary: boolean }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid positions format' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // 1. Create User for Login
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);

    // Wrap in transaction to prevent orphaned user accounts if player creation fails
    const player = await prisma.$transaction(async (tx) => {
      // 1. Create User for Login
      await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'PLAYER'
        }
      });

      // 2. Create Player Record
      return await tx.player.create({
        data: {
          name,
          email,
          studentId: studentId.toLowerCase(),
          sessionId,
          jerseyName,
          jerseyNumber: jerseyNumber || null,
          imageUrl,
          imagePublicId,
          positions: {
            create: parsedPositions
          }
        },
        include: {
          positions: true
        }
      });
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('player_registered', player);
      io.emit('data_updated', { entity: 'players' });
    }

    return res.json(player);
  } catch (error: any) {
    console.error('REGISTER PLAYER ERROR:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Student ID already registered' });
    }
    if (error.http_code === 400 && error.message) {
      return res.status(400).json({ error: `Image Upload Error: ${error.message}` });
    }
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getPublicPlayers = async (req: Request, res: Response): Promise<any> => {
  try {
    const players = await prisma.player.findMany({
      include: {
        positions: true,
        team: true,
        category: true
      },
      orderBy: { name: 'asc' }
    });
    return res.json(players);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPlayers = async (req: Request, res: Response): Promise<any> => {
  try {
    const players = await prisma.player.findMany({
      include: {
        positions: true,
        team: true,
        category: true
      },
      orderBy: { name: 'asc' }
    });
    return res.json(players);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePlayer = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const user = (req as any).user;
    
    if (user.role === 'PLAYER') {
      const playerRecord = await prisma.player.findUnique({ where: { id } });
      if (!playerRecord || playerRecord.email !== user.email) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const { status, name, studentId, sessionId, jerseyName, jerseyNumber, positions, categoryId } = req.body;
    
    let data: any = {};
    if (status !== undefined && user.role !== 'PLAYER') data.status = status;
    if (name !== undefined) data.name = name;
    if (studentId !== undefined) data.studentId = studentId.toLowerCase();
    if (sessionId !== undefined) data.sessionId = sessionId;
    if (jerseyName !== undefined) data.jerseyName = jerseyName;
    if (jerseyNumber !== undefined) data.jerseyNumber = jerseyNumber || null;
    if (categoryId !== undefined && user.role !== 'PLAYER') data.categoryId = categoryId || null;

    if (req.file) {
      const uploadResult = await uploadFromBuffer(req.file.buffer, 'gstu_liga_players');
      data.imageUrl = uploadResult.secure_url;
      data.imagePublicId = uploadResult.public_id;
    }

    // Handle positions update if provided
    if (positions && Array.isArray(positions)) {
      // First, update the player details
      await prisma.player.update({
        where: { id },
        data
      });
      
      // Delete old positions
      await prisma.playerPosition.deleteMany({ where: { playerId: id } });
      
      // Create new positions
      await prisma.playerPosition.createMany({
        data: positions.map(pos => ({
          playerId: id,
          position: pos.position,
          isPrimary: pos.isPrimary
        }))
      });
      
      // Fetch the updated player with relations
      const updatedPlayer = await prisma.player.findUnique({
        where: { id },
        include: { positions: true, team: true, category: true }
      });
      if (status !== undefined) {
        await recalculateRosterLimits();
      }
      return res.json(updatedPlayer);
    } else {
      // Simple update if no positions provided
      const player = await prisma.player.update({
        where: { id },
        data,
        include: { positions: true, team: true, category: true }
      });
      ioInstance.emit('data_updated', { entity: 'players' });
      if (status !== undefined) {
        await recalculateRosterLimits();
      }
      return res.json(player);
    }
  } catch (error) {
    console.error('UPDATE PLAYER ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePlayer = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    
    // Find player first to get studentId and imagePublicId
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    
    // Delete image from Cloudinary
    if (player.imagePublicId) {
      const cloudinary = require('../../lib/cloudinary').default;
      await cloudinary.uploader.destroy(player.imagePublicId).catch(console.error);
    }
    
    // Delete player from DB
    await prisma.player.delete({ where: { id } });
    
    // Also delete their login account
    await prisma.user.delete({ where: { email: player.email } }).catch(() => {
      // Ignore error if user account doesn't exist
    });
    
    ioInstance.emit('data_updated', { entity: 'players' });
    return res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
