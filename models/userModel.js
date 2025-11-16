import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import bcrypt from "bcrypt"

const User=sequelize.define("User",{

    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    fullName:{
        type:DataTypes.STRING,
        allowNull:false,

    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    }
    ,
    password:{
         type:DataTypes.STRING,
        allowNull:false
    },

     gender:{
         type:DataTypes.ENUM("male","female","other"),
        allowNull:false
    },
    profileImage:{
        type:DataTypes.STRING,
        allowNull:true
    },
     role: {
      type: DataTypes.ENUM("admin","user"),
      defaultValue: "user",
    },
},
{
    timestamps: true,
    freezeTableName: true, 
    tableName: "users",

}
)

User.beforeCreate(async(user)=>{
    const salt=await bcrypt.genSalt(10)
    user.password=await bcrypt.hash(user.password,salt)
})

User.beforeUpdate(async(user)=>{
    if(user.changed("password")){
         const salt=await bcrypt.genSalt(10)
         user.password=await bcrypt.hash(user.password,salt)
    }
})

User.prototype.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

export default User