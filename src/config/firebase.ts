import { cert, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const serviceAccount = require(process.env.SERVICE_ACCOUNT_PATH!);

initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://chatting-app-ad89a-default-rtdb.firebaseio.com"
})

export const db = getDatabase();