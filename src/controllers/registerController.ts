import { Request, Response } from "express";
import streamifier from "streamifier";
import { cloudinary } from "../config/cloudinary";
import { db } from "../config/firebase";

export const registerController = async (req: Request, res: Response) => {
    const { phone } = req.body;

    try {
        const snapshot = await db.ref(`users/${phone}`).once("value");

        if (snapshot.exists()) {
            //console.log("Phone already registered");
            res.status(200).json({
                exists: true,
                message: "Phone already registered"
            });
            return;
        }

        await db.ref(`users/${phone}`).set({
            created_at: new Date().toISOString(),
            name: null,
            profile_image: null,
        });

        res.status(200).json({ 
            exists: false, 
            message: "User registered successfully" 
        });
    } catch (error) {
        res.status(500).send({ error: "Failed to save user" });
    }
}

export const updateProfileController = async (req: Request, res: Response) => {
    const { phone, name } = req.body;
    //console.log(phone)
    const file = req.file;

    if (file && file.size > 1 * 1024 * 1024) {
        res.status(400).json({ error: "Image size exceeds 1MB limit" });
    }

    try{
        let photoUrl = "";

        if (file) {
            const streamUpload = () => {
                return new Promise<string>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({
                        folder: 'profile_images',
                        public_id: `${phone}_${Date.now()}`,
                        resource_type: 'image'
                    }, (error, result) => {
                        if (result?.secure_url) resolve(result.secure_url);
                        else reject(error);
                    });

                    streamifier.createReadStream(file.buffer).pipe(stream);
                });
            }

            photoUrl = await streamUpload();
        }

        await db.ref(`users/${phone}`).update({
            name,
            profile_image: photoUrl || null
        });

        res.status(200).send({ message: "User profile updated successfully" });
    } catch (error) {
        res.status(500).send({ error: "Failed to update user profile" });
    }
}