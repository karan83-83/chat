import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";           // <-- ADD
import { Server } from "socket.io"; // <-- ADD

import { dbConfig, sequelize } from "./config/dbConfig.js";
import router from "./routes/apiRoutes.js";
import association from "./association.js";



dotenv.config();

const app = express();
app.use('/uploads', express.static('uploads'));

app.use(cors({
  methods: ["POST", "GET", "PATCH", "DELETE"],
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
association();

// Create HTTP server for socket.io
const server = http.createServer(app);

// SOCKET.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// User socket map
const onlineUsers = new Map();

io.on("connection", (socket) => {
  // console.log("User connected: ", socket.id);

  socket.on("add-user", (userId) => {
    
    onlineUsers.set(Number(userId), socket.id);
  });

socket.on("send-msg", (data) => {
  // console.log("SEND-MSG DATA =>", data);

  const receiverSocketId = onlineUsers.get(Number(data.to));
  // console.log("Receiver Socket:", receiverSocketId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("msg-receive", {
      message: data.message,
      from: data.from,
    });
  }
});




  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

//   DB Sync
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("DB Sync successfully");
  } catch (error) {
    console.log("DB Sync Failed");
    process.exit(1);
  }
})();

app.use("/api", router);  


const PORT = process.env.PORT || 7000;

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
  dbConfig();
});
