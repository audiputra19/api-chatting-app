import { Router } from "express";
import { registerController, updateProfileController } from "../controllers/registerController";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
});

const registerRouter = Router();
registerRouter.post("/register", registerController);
registerRouter.post("/update-profile", upload.single("photo"), updateProfileController);

export default registerRouter;