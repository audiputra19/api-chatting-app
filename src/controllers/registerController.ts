import { Request, Response } from "express";
import { db } from "../config/firebase";

export const registerController = async (req: Request, res: Response) => {
    const { phone } = req.body;

    try {
        await db.ref(`users/${phone}`).set({
            created_at: new Date().toISOString(),
            name: null,
            profile_image: null,
        });

        res.status(200).send({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).send({ error: "Failed to save user" });
    }
}

export const updateProfileController = async (req: Request, res: Response) => {
    const { phone, name, profileImage } = req.body;

    try {
        await db.ref(`users/${phone}`).update({
            name,
            profile_image: profileImage,
        });

        res.status(200).send({ message: "User profile updated successfully" });
    } catch (error) {
        res.status(500).send({ error: "Failed to update user profile" });
    }
}