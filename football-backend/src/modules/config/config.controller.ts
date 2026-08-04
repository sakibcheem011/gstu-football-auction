import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { Phase } from '@prisma/client';

export const getConfig = async (req: Request, res: Response): Promise<any> => {
  try {
    let config = await prisma.systemConfig.findUnique({
      where: { id: 'singleton' }
    });
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          id: 'singleton',
          currentPhase: Phase.SETUP,
          totalBudget: 1500000,
          minRosterSize: 15
        }
      });
    }
    return res.json(config);
  } catch (error) {
    console.error('GET CONFIG ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateConfig = async (req: Request, res: Response): Promise<any> => {
  try {
    const { currentPhase, totalBudget, minRosterSize, playerBasePrice } = req.body;
    
    // Validate role (must be SUPER_ADMIN)
    if ((req as any).user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const config = await prisma.systemConfig.upsert({
      where: { id: 'singleton' },
      update: {
        ...(currentPhase && { currentPhase }),
        ...(totalBudget !== undefined && { totalBudget }),
        ...(minRosterSize !== undefined && { minRosterSize }),
        ...(playerBasePrice !== undefined && { playerBasePrice })
      },
      create: {
        id: 'singleton',
        currentPhase: currentPhase || Phase.SETUP,
        totalBudget: totalBudget !== undefined ? totalBudget : 1500000,
        minRosterSize: minRosterSize !== undefined ? minRosterSize : 15,
        playerBasePrice: playerBasePrice !== undefined ? playerBasePrice : 5000
      }
    });

    return res.json(config);
  } catch (error) {
    console.error('UPDATE CONFIG ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
