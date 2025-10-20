import express, { Application, NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import morgan from 'morgan';
import cookieparser from 'cookie-parser';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import cors from 'cors';

import route from './routes/router';
import { corsOptions } from './config/cors';

const app: Application = express();
const PORT: number = process.env.APP_PORT != null ? parseInt(process.env.APP_PORT) : 3000;

app.set('trust proxy', 1);
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', route);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.listen(PORT, () => console.log(`⚡️[server]: Server is running at port:${PORT}`));
