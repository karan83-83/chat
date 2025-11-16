import { Sequelize } from "sequelize";
import dotenv from "dotenv"

dotenv.config()

const sequelize=new Sequelize(
     process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    dialect:"mysql",
    
  }
)

const dbConfig=async(req,res)=>{
    try {

        await sequelize.authenticate()
         console.log("Database connected...");
        
    } catch (error) {
        console.error("DB Error:", err);
        process.exit(1)
    }
}

export {sequelize,dbConfig}