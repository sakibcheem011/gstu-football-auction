import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { ioInstance } from '../../sockets';

export const getFixtures = async (req: Request, res: Response): Promise<any> => {
  try {
    const fixtures = await prisma.fixture.findMany({
      include: { matches: { include: { stats: true } } }
    });
    return res.json(fixtures);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createFixture = async (req: Request, res: Response): Promise<any> => {
  try {
    const { teamAId, teamBId, isTwoLegged, venue, scheduledAt1, scheduledAt2 } = req.body;
    
    const fixture = await prisma.fixture.create({
      data: {
        teamAId,
        teamBId,
        isTwoLegged,
        venue,
        matches: {
          create: isTwoLegged 
            ? [
                { legNumber: 1, status: 'SCHEDULED', scheduledAt: scheduledAt1 ? new Date(scheduledAt1) : new Date() },
                { legNumber: 2, status: 'SCHEDULED', scheduledAt: scheduledAt2 ? new Date(scheduledAt2) : new Date() }
              ]
            : [
                { legNumber: 1, status: 'SCHEDULED', scheduledAt: scheduledAt1 ? new Date(scheduledAt1) : new Date() }
              ]
        }
      },
      include: { matches: true }
    });
    ioInstance.emit('data_updated', { entity: 'tournament' });
    return res.json(fixture);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFixture = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    await prisma.fixture.delete({ where: { id } });
    ioInstance.emit('data_updated', { entity: 'tournament' });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMatchScore = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { scoreA, scoreB, status, scheduledAt } = req.body; 
    
    const match = await prisma.match.update({
      where: { id },
      data: { 
        scoreA, 
        scoreB, 
        status,
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) })
      }
    });
    ioInstance.emit('data_updated', { entity: 'tournament' });
    return res.json(match);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePlayerStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const matchId = req.params.matchId as string;
    const { stats } = req.body; 
    // stats is an array of { playerId, goals, assists, yellowCards, redCards, cleanSheet }

    for (const stat of stats) {
      await prisma.playerMatchStat.upsert({
        where: { id: stat.id || 'new' }, // Prisma will fail to find 'new', so it creates. Or we can just delete all stats for match and recreate.
        update: {
          goals: stat.goals,
          assists: stat.assists,
          yellowCards: stat.yellowCards,
          redCards: stat.redCards,
          cleanSheet: stat.cleanSheet
        },
        create: {
          matchId,
          playerId: stat.playerId,
          goals: stat.goals,
          assists: stat.assists,
          yellowCards: stat.yellowCards,
          redCards: stat.redCards,
          cleanSheet: stat.cleanSheet
        }
      });
    }
    // Alternatively, just delete existing stats for the match and create many
    await prisma.playerMatchStat.deleteMany({
      where: { matchId, playerId: { notIn: stats.map((s: any) => s.playerId) } }
    });
    
    ioInstance.emit('data_updated', { entity: 'tournament' });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStandings = async (req: Request, res: Response): Promise<any> => {
  try {
    const teams = await prisma.team.findMany();
    const matches = await prisma.match.findMany({
      where: { status: 'COMPLETED' },
      include: { fixture: true }
    });

    const standings = teams.map(t => ({
      teamId: t.id,
      teamName: t.name,
      logoUrl: t.logoUrl,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0
    }));

    for (const match of matches) {
      const { teamAId, teamBId } = match.fixture;
      const tA = standings.find(s => s.teamId === teamAId);
      const tB = standings.find(s => s.teamId === teamBId);

      if (tA && tB && match.scoreA !== null && match.scoreB !== null) {
        tA.played += 1;
        tB.played += 1;
        tA.gf += match.scoreA;
        tA.ga += match.scoreB;
        tB.gf += match.scoreB;
        tB.ga += match.scoreA;

        if (match.scoreA > match.scoreB) {
          tA.won += 1;
          tA.points += 3;
          tB.lost += 1;
        } else if (match.scoreA < match.scoreB) {
          tB.won += 1;
          tB.points += 3;
          tA.lost += 1;
        } else {
          tA.drawn += 1;
          tB.drawn += 1;
          tA.points += 1;
          tB.points += 1;
        }
      }
    }

    standings.forEach(t => t.gd = t.gf - t.ga);
    
    // Sort by Points, then GD, then GF
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    return res.json(standings);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
