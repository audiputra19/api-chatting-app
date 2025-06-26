import { Request, Response } from "express";
import { db } from "../config/firebase";
import { allContact } from "../interface/contacts";

export const addContactController = async (req: Request, res: Response) => {
    const {firstName, lastName, phone} = req.body;
    // console.log("Received data:", req.body);
    try {
        const addContactRef = db.ref("contacts").push();
        await addContactRef.set({
            firstName,
            lastName,
            phone
        });

        res.status(200).send({ message: "Contact added successfully", id: addContactRef.key });
    } catch (error) {
        console.error("❌ Error saat menyimpan ke Firebase:", error);
        res.status(500).send({ error: "Failed to save contact"});
    }
};

export const allContactController = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.ref("contacts").get();
        const data: Record<string, allContact> = snapshot.val() || {};

        const contacts = Object.entries(data).map(([id, value]) => ({
            id,
            ...value
        }));

        res.json(contacts);
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch contacts" });
    }
};