import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import rulesRoutes from './modules/rules/rules.routes';
import playerRoutes from './modules/players/players.routes';
import teamRoutes from './modules/teams/teams.routes';
import auctionRoutes from './modules/auction/auction.routes';
import configRoutes from './modules/config/config.routes';
import tournamentRoutes from './modules/tournament/tournament.routes';
import systemRoutes from './modules/system/system.routes';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/rules', rulesRoutes);
app.use('/players', playerRoutes);
app.use('/teams', teamRoutes);
app.use('/auction', auctionRoutes);
app.use('/config', configRoutes);
app.use('/tournament', tournamentRoutes);
app.use('/system', systemRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;
