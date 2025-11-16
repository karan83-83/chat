import express from "express"
import { changePassword, deleteUser, forgotPassword, getAllUsers, getUserById, loginUser, register, resetPassword, updateProfile } from "../../controllers/auth/userController.js"
import upload from "../../middleware/multer.js"

const  auth_router=express.Router()

auth_router.post("/register",upload.single("profileImage"),register)
auth_router.post("/login",loginUser)
auth_router.get("/getAllUsers",getAllUsers)
auth_router.get("/getUserById/:id",getUserById)
auth_router.patch("/changePassword/:id",changePassword)
auth_router.patch("/updateProfile/:id",upload.single("profileImage"),updateProfile)
auth_router.post("/forgotPassword",forgotPassword)
auth_router.post("/resetPassword",resetPassword)
auth_router.delete("/deleteUser/:id",deleteUser)

export default auth_router