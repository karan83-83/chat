import User from "./models/userModel.js";
import Message from "./models/messageModel.js";

const association=async(req,res)=>{
 
    Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });

}

export default association