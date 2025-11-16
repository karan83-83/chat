import { DataTypes } from "sequelize";
import {sequelize} from "../config/dbConfig.js";


const Message = sequelize.define("Message", {
  senderId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

// Associations


export default Message;
