import express from "express"
import auth_router from "./authRoutes/authRoutes.js";
import chatrouter from "./chatRoutes/chatRoutes.js";


const  router=express.Router()

router.use("/auth", auth_router);

// Base route for chat
router.use("/chat", chatrouter);

export default router