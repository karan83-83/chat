import multer from "multer";
import fs, { existsSync } from "fs"
import path from "path";


const uploadPath="uploads/"

if(!existsSync(uploadPath)){
    fs.mkdirSync(uploadPath,{recursive:true})
}

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,uploadPath)
    },
    filename:function(req,file,cb){
         const uniqueSuffix=Date.now()+"-"+Math.round(Math.random()*1e9);
          const ext = path.extname(file.originalname);
           cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
})
const upload=multer({
     storage:storage,
    limits:{fileSize: 5*1024 *1024},
})

export default upload