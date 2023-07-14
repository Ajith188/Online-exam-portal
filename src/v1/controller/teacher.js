const userTechModel=require('../model/userTech')
const asyncHandler = require('express-async-handler')   /////Api is error automatic next api is excuted for express-async-handler
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')


const generatedToken = (id) => {
    return jwt.sign({ id }, "damalDumil", { expiresIn: "1d" })
}

exports.teacherLogin = asyncHandler(async function (req, res) {
    const { username, password } = req.body
    if (!username || !password) {
        res.send({ status: 400, mssg: "Please Add email and Password" })
    }
    const teacher = await userTechModel.userTech.findOne({ username })
    // console.log(teacher._id)
    if (!teacher) {
        res.send({ status: 400, mssg: "User not found ,please signup" })
    }
    const passwordIsCorrect = await bcrypt.compare(password, teacher.password)
    if (teacher && passwordIsCorrect) {
        const token = generatedToken(teacher._id)
        //send HTTP_only Cookie
        res.cookie('token', token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), //1day
            sameSite: "none",
            secure: true
        })
        res.send({ status: 200, message: "Login successfully", data: teacher })
    } else {
        res.send({ status: 400, mssg: "Invalid User or password" })
    }
})

exports.loginStatus = asyncHandler(async function (req, res) {
    const token = req.cookies.token
    // console.log(""token)
    if (!token) {
        return res.json(false)
    }
    //verify token
    const verified = jwt.verify(token, "damalDumil");
    if (verified) {
        return res.json(true)
    } else {
        return res.json(false)
    }
})



exports.logout = asyncHandler(async function (req, res) {
    res.cookie('token', "", {  /// npm install for cookie-parser
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true
    });
    return res.send({ status: 200, mssg: "Successfully Logged Out" })
})

exports.getuser = asyncHandler(async function (req, res) { 
    const userId = req.body?.id ? new mongoose.Types.ObjectId(req.body.id)  : req.user._id
    // console.log("----userId-----",userId, req.body.id)

    const user = await userTechModel.userTech.findById(userId)
    // console.log("user", user);
    if (user) {
        res.send({ status: 200, mssg: "", data: user })
    } else {
        res.send({ status: 400, mssg: "Invalid data" })
    }
})


exports.remove=asyncHandler(async function(req,res){
    const userId = req.body?.id ? new mongoose.Types.ObjectId(req.body.id)  : req.user._id
    // console.log("----userId-----",userId, req.body.id)
    const usertype=await userTechModel.userTech.findById(userId)
    // console.log("usertype",usertype.usertype)
    if (usertype.usertype == "TEACHER") {
        const user = await userTechModel.userTech.findByIdAndDelete(userId)
        // console.log("user", user);
        if (user) {
            res.send({ status: 200, mssg: "Remove the Data", })
        } else {
            res.send({ status: 400, mssg: "Invalid data" })
        }
    } else {
        res.send({ status: 400, mssg: "Invalid UserType" })
    } 
})


