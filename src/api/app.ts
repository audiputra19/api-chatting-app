import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from "express";
import contactRouter from "../routers/contactRouter";
import cors from "cors";
import registerRouter from '../routers/registerRouter';
import userRouter from '../routers/userRouter';
import http from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from '../socket/socket';
import chatRouter from '../routers/chatRouter';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.json());
app.use(cors())
app.use('/', contactRouter);
app.use('/', registerRouter);
app.use('/', userRouter);
app.use('/', chatRouter);

registerSocketHandlers(io);

app.get('/api/hello', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Hello from Express + Vercel!' });
});

// Export as Vercel serverless function
export default (req: Request, res: Response) => {
  return app(req, res);
};