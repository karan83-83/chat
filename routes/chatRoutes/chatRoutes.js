import express from "express";
import { sendMessage, getMessages, getUserChatHistory, getChatUsersList } from "../../controllers/chat/chatController.js";

const chatrouter = express.Router();

// router.get("/search", searchUser);         
chatrouter.post("/send", sendMessage);         
chatrouter.get("/messages", getMessages); 
chatrouter.get("/getChatUserHistory",getUserChatHistory) 
chatrouter.get("/getChatUsersList",getChatUsersList)    

export default chatrouter;
