import { cert, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.SERVICE_ACCOUNT_PATH || "", "base64").toString("utf-8")
);

initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://chatting-app-ad89a-default-rtdb.firebaseio.com"
})

export const db = getDatabase();