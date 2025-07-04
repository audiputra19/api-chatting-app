import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import contactRouter from "./routers/contactRouter";
import cors from "cors";
import registerRouter from './routers/registerRouter';
import userRouter from './routers/userRouter';
import http from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from './socket/socket';
import chatRouter from './routers/chatRouter';

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

const port = 3001;
server.listen(port, () => {
    console.log(`Listening on port ${port}`)
});