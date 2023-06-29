import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './api/routes';

dotenv.config();
const app: Express = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to SpaceRunners Restaurants!');
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`[server]: Server is really running at http://localhost:${port}`);
});
