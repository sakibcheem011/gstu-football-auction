import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { ioInstance } from '../../sockets';
import { recalculateRosterLimits } from '../rules/rules.controller';

export const createTeam = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, managerEmail, managerName, managerPassword, managerPhone, purse } = req.body;
    
    const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
    // Use custom purse if provided, otherwise fallback to system default
    const remainingBudget = purse ? parseInt(purse, 10) : (config?.totalBudget || 100000);

    let manager = null;
    if (managerEmail && managerPassword) {
      const passwordHash = await bcrypt.hash(managerPassword, 10);
      manager = await prisma.user.create({
        data: {
          email: managerEmail,
          name: managerName || 'Team Manager',
          phone: managerPhone || null,
          passwordHash,
          role: Role.TEAM_MANAGER,
        }
      });
    }

    const team = await prisma.team.create({
      data: {
        name,
        remainingBudget,
        managerId: manager?.id || null
      }
    });

    await recalculateRosterLimits();
    ioInstance.emit('data_updated', { entity: 'teams' });
    return res.json(team);
  } catch (error: any) {
    console.error('CREATE TEAM ERROR:', error);
    if (error.code === 'P2002') return res.status(400).json({ error: 'Manager email or phone already exists' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeams = async (req: Request, res: Response): Promise<any> => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: {
          include: {
            positions: true
          }
        },
        manager: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });
    return res.json(teams);
  } catch (error) {
    console.error('GET TEAMS ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingManagers = async (req: Request, res: Response): Promise<any> => {
  try {
    const managers = await prisma.user.findMany({
      where: {
        role: Role.TEAM_MANAGER,
        isApproved: false
      },
      select: { id: true, name: true, email: true, phone: true, desiredTeamName: true }
    });
    return res.json(managers);
  } catch (error) {
    console.error('GET PENDING MANAGERS ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveManager = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, teamName, purse } = req.body;
    
    if (!userId || !teamName) {
      return res.status(400).json({ error: 'User ID and Team Name are required' });
    }

    const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
    const remainingBudget = purse ? parseInt(purse, 10) : (config?.totalBudget || 100000);

    // Update user to approved
    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true }
    });

    // Create team for the manager
    const team = await prisma.team.create({
      data: {
        name: teamName,
        remainingBudget,
        managerId: userId
      }
    });

    await recalculateRosterLimits();
    ioInstance.emit('data_updated', { entity: 'teams' });
    return res.json(team);
  } catch (error: any) {
    console.error('APPROVE MANAGER ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectManager = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.id as string;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    // Ensure user exists and is a pending manager
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.TEAM_MANAGER || user.isApproved) {
      return res.status(400).json({ error: 'Invalid pending manager' });
    }

    await prisma.user.delete({ where: { id: userId } });
    ioInstance.emit('data_updated', { entity: 'teams' });
    
    return res.json({ message: 'Manager rejected and removed' });
  } catch (error: any) {
    console.error('REJECT MANAGER ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateManager = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { name, email, phone, password, teamName, purse } = req.body;
    
    const team = await prisma.team.findUnique({ where: { id }, include: { manager: true } });
    if (!team) return res.status(404).json({ error: 'Franchise not found' });

    // Update Team details
    if (teamName || purse !== undefined) {
      await prisma.team.update({
        where: { id },
        data: {
          name: teamName || team.name,
          remainingBudget: purse !== undefined ? parseInt(purse, 10) : team.remainingBudget
        }
      });
    }

    // Update Manager details if manager exists
    if (team.managerId) {
      let data: any = { name, email, phone: phone || null };
      if (password && password.length > 0) {
        data.passwordHash = await bcrypt.hash(password, 10);
      }

      await prisma.user.update({
        where: { id: team.managerId },
        data
      });
    }

    ioInstance.emit('data_updated', { entity: 'teams' });
    return res.json({ message: 'Franchise updated successfully' });
  } catch (error: any) {
    console.error('UPDATE MANAGER ERROR:', error);
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email or phone already in use' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeam = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) return res.status(404).json({ error: 'Franchise not found' });

    // First delete the team (due to relationships)
    await prisma.team.delete({ where: { id } });

    // Then delete the manager if it exists
    if (team.managerId) {
      await prisma.user.delete({ where: { id: team.managerId } });
    }
    await recalculateRosterLimits();
    ioInstance.emit('data_updated', { entity: 'teams' });
    return res.json({ message: 'Franchise and Manager deleted successfully' });
  } catch (error) {
    console.error('DELETE TEAM ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWishlist = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== Role.TEAM_MANAGER) return res.status(403).json({ error: 'Unauthorized' });

    const team = await prisma.team.findUnique({
      where: { managerId: user.id },
      include: { wishlistPlayers: { select: { id: true } } }
    });

    if (!team) return res.status(404).json({ error: 'Team not found' });
    
    return res.json(team.wishlistPlayers.map(p => p.id));
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleWishlist = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { playerId } = req.body;
    
    if (!user || user.role !== Role.TEAM_MANAGER) return res.status(403).json({ error: 'Unauthorized' });

    const team = await prisma.team.findUnique({
      where: { managerId: user.id },
      include: { wishlistPlayers: { select: { id: true } } }
    });

    if (!team) return res.status(404).json({ error: 'Team not found' });

    const isWishlisted = team.wishlistPlayers.some(p => p.id === playerId);
    
    if (isWishlisted) {
      await prisma.team.update({
        where: { id: team.id },
        data: { wishlistPlayers: { disconnect: { id: playerId } } }
      });
    } else {
      await prisma.team.update({
        where: { id: team.id },
        data: { wishlistPlayers: { connect: { id: playerId } } }
      });
    }

    return res.json({ wishlisted: !isWishlisted });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadTeamLogo = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    
    if (!user) return res.status(403).json({ error: 'Unauthorized' });
    if (user.role !== Role.SUPER_ADMIN) {
      const team = await prisma.team.findUnique({ where: { id } });
      if (!team || team.managerId !== user.id) {
        return res.status(403).json({ error: 'You are not authorized to update this team' });
      }
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { uploadFromBuffer } = require('../../lib/cloudinary');
    const uploadResult = await uploadFromBuffer(req.file.buffer, 'gstu_liga_teams');
    const logoUrl = uploadResult.secure_url;
    const logoPublicId = uploadResult.public_id;

    const existingTeam = await prisma.team.findUnique({ where: { id } });
    if (existingTeam?.logoPublicId) {
      const cloudinary = require('../../lib/cloudinary').default;
      await cloudinary.uploader.destroy(existingTeam.logoPublicId).catch(console.error);
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: { logoUrl, logoPublicId }
    });

    ioInstance.emit('data_updated', { entity: 'teams' });
    return res.json(updatedTeam);
  } catch (error: any) {
    console.error('UPLOAD TEAM LOGO ERROR:', error);
    if (error.http_code === 400 && error.message) {
      return res.status(400).json({ error: `Image Upload Error: ${error.message}` });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
