import { Router } from "express";
import { addContactController, allContactController, checkNumberRegisterController } from "../controllers/contactController";

const contactRouter = Router();
contactRouter.post("/add-contacts", addContactController);
contactRouter.post("/all-contacts", allContactController);
contactRouter.post("/check-number", checkNumberRegisterController);

export default contactRouter;