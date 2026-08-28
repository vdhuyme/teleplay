import express, { type Application } from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { setGlobalOptions } from 'express-zod-safe';
import { playerRoutes } from './players';
import { groupRoutes } from './groups';
import { errorHandler, notFoundHandler } from './middleware';

setGlobalOptions({ defaultSchemaObject: 'lax', missingSchemaBehavior: 'any' });

const logger = pino();
const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

app.use('/players', playerRoutes);
app.use('/groups', groupRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app, logger };
