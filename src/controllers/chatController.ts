import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Chat, ChatRoom } from "../interface/chat";
import { Contact } from "../interface/contacts";
import { Users } from "../interface/users";


export const chatRoomController = async (req: Request, res: Response) => {
    const { user, user2 } = req.body;

    try {
        const sortedIds = [user, user2].sort(); 
        const roomId = `${sortedIds[0]}_${sortedIds[1]}`;
        const snapshot = await db.ref(`chat_rooms/${roomId}`).once("value");
        const data: Record<string, ChatRoom> = snapshot.val();

        res.status(200).json(data);
    } catch (error) {
        res.status(500).send({ error: "Failed to create chat room" });
    }
}

export const chatMessageController = async (req: Request, res: Response) => {
    const { roomId } = req.body;

    //console.log("Received roomId:", roomId);
    
    try {
        const snapshot = await db.ref(`chats`)
            .orderByChild("id_room")
            .equalTo(roomId)
            .once("value");

        const data: Record<string, Chat> | null = snapshot.val();

        if (!data) {
            res.status(200).json([]);
            return;
        }

        const message = Object.entries(data).map(([firebase, value]) => {
            const { id: _ignored, ...rest } = value;
            return {
                id: firebase,
                ...rest
            };
        });
        res.status(200).json(message);
    } catch (error) {
        res.status(500).send({ error: "Failed to send message" });
    }
}

export const chatBoxController = async (req: Request, res: Response) => {
    const { user } = req.body;

    try {
        const roomChatSnap = await db.ref('chat_rooms').once('value');
        const roomChatData: Record<string, ChatRoom> = roomChatSnap.val();

        if(!roomChatData) {
            res.status(200).json([]);
            return;
        }

        const result = await Promise
            .all(Object.entries(roomChatData)
            .map(async ([key, roomChat]) => {

            console.log(roomChat.user2);    

            let lastMessage: Chat | null = null;
            const unreadMessages: Chat[] = [];
            if (roomChat.user === user || roomChat.user2 === user) {
                const chatSnap = await db.ref('chats')
                .orderByChild('id_room')
                .equalTo(roomChat.id)
                .once('value');
                
                chatSnap.forEach((chat) => {
                    const message = chat.val() as Chat;   

                    if (!lastMessage || new Date(message.dateTime) > new Date(lastMessage.dateTime)) {
                        lastMessage = message;
                    }

                    if (message.status !== 'read' && message.id_sender !== user) {
                        unreadMessages.push(message);
                    }
                }); 
                
                const lawanBicara = user === roomChat.user ? roomChat.user2 : roomChat.user;

                const [userSnap, contactSnap] = await Promise.all([
                    db.ref(`users/${lawanBicara}`).once('value'),
                    db.ref(`contacts/${user}/${lawanBicara}`).once("value")
                ]);

                const userData: Users = userSnap.val();
                const contactData: Contact = contactSnap.val();

                const contactName = contactData ? `${contactData.firstName} ${contactData.lastName}` : roomChat.user2;
                const userProfileImage = userData?.profile_image || null;

                return {
                    id: roomChat.id,
                    sender: roomChat.user === user ? roomChat.user2 : roomChat.user,
                    lastMessage: (lastMessage as Chat | null)?.message ?? '',
                    unreadMessages: unreadMessages.length,
                    dateTime: (lastMessage as Chat | null)?.dateTime ?? '',
                    name: contactName,
                    profile_image: userProfileImage
                }
            }
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: "Failed to load messages" });
    }
}