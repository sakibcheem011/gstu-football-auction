import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth';

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    // We now accept loginId instead of email, but support email for backwards compatibility
    const loginId = req.body.loginId || req.body.email; 
    const password = req.body.password;
    
    if (!loginId) return res.status(400).json({ error: 'Email or Phone is required' });

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { phone: loginId }
        ]
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role === 'TEAM_MANAGER' && !user.isApproved) {
      return res.status(403).json({ error: 'Account pending admin approval. Please wait for an Admin to verify your registration.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerManager = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone, password, desiredTeamName } = req.body;
    
    if (!name || !email || !password || !desiredTeamName) {
      return res.status(400).json({ error: 'Name, email, password, and desired team name are required.' });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone: phone || undefined }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Email or phone already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'TEAM_MANAGER',
        isApproved: false,
        desiredTeamName
      }
    });

    return res.status(201).json({ message: 'Registration successful! Please wait for admin approval.', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Register Manager Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (user.role === 'TEAM_MANAGER') {
      const team = await prisma.team.findUnique({
        where: { managerId: user.id },
        include: {
          players: true
        }
      });
      return res.json({ ...fullUser, team });
    }

    if (user.role === 'PLAYER') {
      const playerRecord = await prisma.player.findUnique({
        where: { email: fullUser!.email },
        include: {
          positions: true,
          team: true
        }
      });
      return res.json({ ...fullUser, playerRecord });
    }

    return res.json(fullUser);
  } catch (error) {
    console.error('GET ME ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStaff = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, email, password, role } = req.body;
    if (role !== 'PODIUM_ADMIN' && role !== 'SUPER_ADMIN') {
      return res.status(400).json({ error: 'Invalid staff role' });
    }
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role }
    });

    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStaff = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'PODIUM_ADMIN'] }
      },
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    return res.json(staff);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStaff = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    
    // Prevent self-deletion
    if (req.user?.id === id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || (user.role !== 'PODIUM_ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error("DELETE STAFF ERROR:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
