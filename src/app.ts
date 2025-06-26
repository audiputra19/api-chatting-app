import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import contactRouter from "./routers/contactRouter";
import cors from "cors";
import registerRouter from './routers/registerRouter';

const app = express();
app.use(express.json());
app.use(cors())
app.use('/', contactRouter);
app.use('/', registerRouter);

const port = 3001;
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});