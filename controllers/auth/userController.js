import User from "../../models/userModel.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config()

export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

export const generateRefreshToken = (user) => {
 
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
};

export const register=async(req,res)=>{
    const {fullName,email,phone,password,role,gender}=req.body;
    const profileImage=req.file?req.file.filename:null
    try {

        if (!fullName || !email || !password || !gender) {
            return res
                .status(400)
                .json({ message: "Please fill all required fields",status:false });
        }
    const existsEmail=await User.findOne({where:{email}})
    if(existsEmail){
       return res.status(401).json({message:"user alreadt exists",status:false})
    }
    const user=await User.create({
        fullName,email,phone,password,profileImage,role,gender  
    })

    res.status(201).json({message:"User Register Successfully",status:true,data:user})
    
        
    } catch (error) {
        console.log("Error",error)
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found",status:false });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials",status:false  });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            message: "Login successful",
            accessToken,
            refreshToken,
            role: user.role,
            userId: user.id,
            status:true



        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getAllUsers = async (req, res) => {

    try {
        const {search,email,role,page=1,limit=10}=req.query

        const whereCondition={};

          if (search) {
      whereCondition[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
         
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
        if(role){
            whereCondition.role={[Op.like]:`%${role}%`}
        }
        if(email){
            whereCondition.email={[Op.like]:`%${email}%`}
        }
        const offset = (page - 1) * limit;

     const { count, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ["password","tempPassword"] },
      
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
     if (!users || users.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No users found",

      });
    }
    res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        totalUsers: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      },
    });



        
        

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


export const getUserById = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] }
        });
        if (!user) {
            return res.status(401).json({ message: "User not found" });

        }
        res.status(201).json({ message: "User fetched Successfully", data: user })

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const changePassword = async (req, res) => {

    const { oldPassword, newPassword } = req.body
    const { id } = req.params
    try {

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(401).json({ message: "User not found",status:false  });

        }

        const isMatched = await user.matchPassword(oldPassword);
        if (!isMatched) {
            return res.status(400).json({ message: "Old password is incorrect",status:false  });
        }
        user.password = newPassword
        user.save();
        return res.status(200).json({ message: "Password changed successfully",status:true  });




    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


export const updateProfile = async (req, res) => {
    const { fullName, email, gender,phone

     } = req.body
    const profileImage = req.file ? req.file.filename : null

    const { id } = req.params
    try {
        const user = await User.findByPk(id)
        if (!user) {
            return res.status(401).json({ message: "User not found",status:false  });

        }
        user.fullName = firstName || user.fullName;
        user.phone=phone || user.phone
        
        user.email = email || user.email;
        user.gender = gender || user.gender;
        user.profileImage = profileImage;

        await user.save()
        return res.status(200).json({
            message: "Profile updated successfully",
            data: user,
            status:true 
        });


    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
       const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "User not found",status:false  });

        }

        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        await transporter.sendMail({
            from: `"Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: `
        <h3>Password Reset Request</h3>
        <p>Hello ${user.firstName || "User"},</p>
        <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <br /><br />
        <p>If you didn’t request this, please ignore this email.</p>
      `
        })

        res.status(200).json({
            message: "Password reset link sent to your email",
            resetLink,
            status:true
        });




    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" ,status:false });
        }
        user.password = newPassword
        user.save();
         res.status(200).json({
      message: "Password reset successful. You can now log in with your new password.",
      status:true
    });




    } catch (error) {
    console.error("Reset Password Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset link expired. Please request a new one." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid or corrupted token." });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
}


export const deleteUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(401).json({ message: "User not found",status:false  });

        }
        await user.destroy()
        res.status(201).json({ message: "User deleted Successfully",status:true })

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}