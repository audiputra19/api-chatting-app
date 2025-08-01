import { Router } from "express";
import { userController } from "../controllers/userController";

const userRouter = Router();
userRouter.post("/users", userController);

export default userRouter;