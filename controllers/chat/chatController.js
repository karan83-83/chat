import { Op } from "sequelize";
import Message from "../../models/messageModel.js";
import User from "../../models/userModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message
    });

    res.status(201).json({
      status: true,
      message: "Message sent",
      data: newMessage
    });

  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    const messages = await Message.findAll({
      where: {
        senderId: [user1, user2],
        receiverId: [user1, user2],
      },
      order: [["createdAt", "ASC"]]
    });

    res.json({
      status: true,
      data: messages
    });

  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

export const getUserChatHistory = async (req, res) => {
  try {
    const { userId } = req.query;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "fullName", "email", "profileImage"]
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "fullName", "email", "profileImage"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json({
      status: true,
      data: messages
    });

  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

export const getChatUsersList = async (req, res) => {
  try {
    const { userId } = req.query;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "fullName", "email", "profileImage"]
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "fullName", "email", "profileImage"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const usersMap = new Map();

    messages.forEach(msg => {
      let otherUser = null;

      if (msg.senderId == userId) {
        otherUser = msg.receiver;   // receiver user object
      } else {
        otherUser = msg.sender;     // sender user object
      }

      if (otherUser && !usersMap.has(otherUser.id)) {
        usersMap.set(otherUser.id, {
          id: otherUser.id,
          fullName: otherUser.fullName,
          email: otherUser.email,
          profileImage: otherUser.profileImage,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt
        });
      }
    });

    res.json({
      status: true,
      data: Array.from(usersMap.values())
    });

  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};


