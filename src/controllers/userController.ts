import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Users } from "../interface/users";
import { Contact } from "../interface/contacts";

export const userController = async (req: Request, res: Response) => {
    const { user, user2 } = req.body;
    //console.log(user, user2);
    try {

        const userSnap = await db.ref(`users/${user2}`).once("value");
        const dataUsers: Users = userSnap.val();

        const contactSnap = await db.ref(`contacts/${user}/${user2}`).once("value");
        const contactData: Contact = contactSnap.val();

        if(!contactData) {
            const data = {
                phone: user2,
                name: user2,
                profile_image: dataUsers.profile_image,
                created_at: dataUsers.created_at
            }
            res.json(data);
        } else {
            const data = {
                phone: contactData.phone === user2 ? user : user2,
                name: `${contactData.firstName} ${contactData.lastName}`,
                profile_image: dataUsers.profile_image,
                created_at: dataUsers.created_at
            }
            res.json(data);
        }
    } catch (error) {
        res.status(500).send({ error: "Failed to save user" });
    }
}