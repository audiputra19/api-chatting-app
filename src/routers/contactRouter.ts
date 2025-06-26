import { Router } from "express";
import { addContactController, allContactController } from "../controllers/contactController";

const contactRouter = Router();
contactRouter.post("/add-contacts", addContactController);
contactRouter.get("/all-contacts", allContactController);

export default contactRouter;