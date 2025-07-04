import { Request, Response } from "express";
import { db } from "../config/firebase";
import { AllContact } from "../interface/contacts";

export const addContactController = async (req: Request, res: Response) => {
    const {userPhone, firstName, lastName, newContact} = req.body;
    // console.log("Received data:", req.body);
    try {

        const snapshot = await db.ref(`users/${newContact}`).once("value");

        if (snapshot.exists()) {
            const addContactRef = db.ref(`contacts/${userPhone}/${newContact}`);
            await addContactRef.set({
                firstName,
                lastName,
            });
            res.status(200).send({ message: "Contact added successfully" });
        } else {
            res.status(200).send({ message: "User not found" });
        }

    } catch (error) {
        console.error("❌ Error saat menyimpan ke Firebase:", error);
        res.status(500).send({ error: "Failed to save contact"});
    }
};

export const allContactController = async (req: Request, res: Response) => {
    const { userPhone } = req.body;

    try {
        const contactSnap = await db.ref(`contacts/${userPhone}`).once("value");
        const contactData = contactSnap.val();

        if (!contactData) {
            res.status(200).json([]);
        }

        const contactPhones = Object.keys(contactData);

        const result = await Promise.all(contactPhones.map(async (contactPhone) => {
            const { firstName, lastName } = contactData[contactPhone];

            const userSnap = await db.ref(`users/${contactPhone}`).once("value");
            const userData = userSnap.val();

            return {
                phone: contactPhone,
                firstName,
                lastName,
                profile_image: userData?.profile_image || null
            };
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch contacts" });
    }
};

export const checkNumberRegisterController = async (req: Request, res: Response) => {
    const { phone } = req.body;

    try {
        const snapshot = await db.ref(`users/${phone}`).once("value");

        if (snapshot.exists()) {
            res.status(200).json({ exists: true });
        } else {
            res.status(200).json({ exists: false });
        }
    } catch (error) {
        res.status(500).send({ error: "Failed to check phone number" });
    }
}