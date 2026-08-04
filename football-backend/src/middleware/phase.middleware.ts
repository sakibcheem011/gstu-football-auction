import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { Phase } from '@prisma/client';

export const requirePhase = (requiredPhase: Phase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
      if (!config) {
        return res.status(500).json({ error: 'System configuration not found' });
      }

      if (config.currentPhase !== requiredPhase) {
        return res.status(403).json({ 
          error: `Action forbidden. Current phase is ${config.currentPhase}, but requires ${requiredPhase}` 
        });
      }

      next();
    } catch (error) {
      console.error('PHASE MIDDLEWARE ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const requireNotPhase = (forbiddenPhase: Phase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
      if (!config) {
        return res.status(500).json({ error: 'System configuration not found' });
      }

      if (config.currentPhase === forbiddenPhase) {
        return res.status(403).json({ 
          error: `Action forbidden during ${forbiddenPhase} phase` 
        });
      }

      next();
    } catch (error) {
      console.error('PHASE MIDDLEWARE ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
