import 'dotenv/config';
import express from 'express'
import { Router, Request, Response } from 'express'
import fetchTourStops from './services/fetchTourStops'; './services/fetchTourStops'

const app = express();
const route = Router();

app.use(express.json())

route.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API Running' });
})

route.get('/routes', async (req: Request, res: Response) => {
  const tours = await fetchTourStops()
  res.json(tours);
})

app.use(route)

app.listen(8181, () => 'server running')