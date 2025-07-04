import { Server } from "socket.io";
import { db } from "../config/firebase";

export const registerSocketHandlers = (io: Server) => {
    io.on("connection", (socket) => {
        
        const onlineUsers = new Map<string, string>();
        socket.on("join", async (user) => {
            onlineUsers.set(user, socket.id);
            console.log(`User ${user} connected`);
            io.emit("onlineUsers", user);

            const snapshot = await db.ref("chats").once("value");

            const updates: Record<string, any> = {};

            snapshot.forEach(child => {
                const chat = child.val();
                const isForUser = chat.id_sender !== user && chat.status === "sent";
                if (isForUser) {
                    updates[`${child.key}/status`] = "delivered";

                    const senderSocket = onlineUsers.get(chat.id_sender);
                    if (senderSocket) {
                        io.to(senderSocket).emit("messageDelivered", {
                            ...chat,
                            id: child.key,
                            status: "delivered"
                        });
                    }
                }
            });

            if (Object.keys(updates).length > 0) {
                await db.ref("chats").update(updates);
            }
        });

        socket.on("readMessage", async ({ roomId, user }) => {
            const snapshot = await db.ref("chats")
                .orderByChild("id_room")
                .equalTo(roomId)
                .once("value");

            const updates: Record<string, any> = {};

            snapshot.forEach(child => {
                const chat = child.val();
                const isForUser = chat.id_sender !== user && chat.status !== "read";

                if (isForUser) {
                    updates[`${child.key}/status`] = "read";

                    const senderSocketId = onlineUsers.get(chat.id_sender);
                    if (senderSocketId) {
                        io.to(senderSocketId).emit("messageRead", {
                            ...chat,
                            id: child.key,
                            status: "read"
                        });
                    }
                }
            });

            if (Object.keys(updates).length > 0) {
                await db.ref("chats").update(updates);
            }
        });

        socket.on("sendMessage", async ({ user, user2, message, type = "text", replyTo = null }) => {
            const sortedIds = [user, user2].sort(); 
            const roomId = `${sortedIds[0]}_${sortedIds[1]}`;

            const snapShot = await db.ref(`chat_rooms/${roomId}`).once("value");

            if (!snapShot.exists()) {
                const chatRoomRef = db.ref(`chat_rooms/${roomId}`);
                const chatRoomData = {
                    id: roomId,
                    user,
                    user2,
                    created_at: new Date().toISOString()
                }
                await chatRoomRef.set(chatRoomData);

                io.emit("chatRoomCreated", chatRoomData);
            }

            const newMessageRef = db.ref(`chats`).push();

            const messageData = {
                id_room: roomId,
                id_sender: user,
                message,
                dateTime: new Date().toISOString(),
                type,
                status: "sent",
                replyTo,
                created_at: new Date().toISOString()
            };

            await newMessageRef.set(messageData);

            const receiverSocketId = onlineUsers.get(user2);

            if (receiverSocketId) {
                await db.ref(`chats/${newMessageRef.key}/status`).set("delivered");

                io.to(receiverSocketId).emit("messageDelivered", {
                    id: newMessageRef.key,
                    ...messageData,
                    status: "delivered"
                });
            }

            io.emit("newMessage", {
                id: newMessageRef.key,
                ...messageData
            });
        });

        socket.on("disconnect", () => {
            let disconnectedUser: string | null = null;
            for(const [user, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUser = user;
                    onlineUsers.delete(user);
                    break;
                }
            }

            if (disconnectedUser) {
                console.log(`User ${disconnectedUser} disconnected`);
                io.emit("offlineUsers", disconnectedUser);
            }
        });
    });
}