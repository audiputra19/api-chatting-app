import { Router } from "express";
import { chatBoxController, chatMessageController, chatRoomController } from "../controllers/chatController";

const chatRouter = Router();

chatRouter.post('/chat-message', chatMessageController);
chatRouter.post('/chat-room', chatRoomController);
chatRouter.post('/chat-box', chatBoxController  );

export default chatRouter;