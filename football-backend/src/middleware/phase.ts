import { Request, Response, NextFunction } from 'express';
import { Phase } from '@prisma/client';
import prisma from '../lib/prisma';

export const requirePhase = (phases: Phase[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
      if (!config) return res.status(500).json({ error: 'System config not found' });
      
      if (!phases.includes(config.currentPhase)) {
        return res.status(403).json({ error: `Route only available in phases: ${phases.join(', ')}` });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
