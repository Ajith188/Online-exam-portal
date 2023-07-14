const model = require('../model/user')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { use } = require('../router/user')
const asyncHandler = require('express-async-handler')   /////Api is error automatic next api is excuted for express-async-handler
const Token=require('../model/token')
const crypto=require('crypto')
const sendmail=require('../controller/lib/sendmail')
const token = require('../model/token')
const { versions } = require('process')
const mongoose = require('mongoose')

const generatedToken = (id) => {
    return jwt.sign({ id }, "damalDumil", { expiresIn: "1d" })
}


exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        res.send({ status: 400, message: "please fill in all required fields" })
    }
    if (password.length < 6) {
        res.send({ status: 400, message: "Password must be up to 6 characters" })
    }
    const userExits = await model.User.findOne({ email })
    if (userExits) {
        res.send({ status: 400, message: "Email has already been registered" })
    }
    const user = await model.User.create(req.body)
    const token = generatedToken(user._id)
    //send HTTP_only Cookie
    res.cookie('token', token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1day
        sameSite: "none",
        secure: true
    })

    if (user) {
        res.send({ status: 201, message: "register successfully", data: user, token })
    } else {
        res.send({ status: 400, message: "Invalid User" })
    }
})


exports.loginUser = asyncHandler(async function (req, res) {
    const { email, password } = req.body
    if (!email || !password) {
        res.send({ status: 400, mssg: "Please Add email and Password" })
    }

    const user = await model.User.findOne({ email })
    if (!user) {
        res.send({ status: 400, mssg: "User not found ,please signup" })
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password)
    if (user && passwordIsCorrect) {
        const token = generatedToken(user._id)
        //send HTTP_only Cookie
        res.cookie('token', token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), //1day
            sameSite: "none",
            secure: true
        })
        res.send({ status: 200, message: "Login successfully", data: user })
    } else {
        res.send({ status: 400, mssg: "Invalid User or password" })
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

    const user = await model.User.findById(userId)
    // console.log("user", user);
    if (user) {
        res.send({ status: 200, mssg: "", data: user })
    } else {
        res.send({ status: 400, mssg: "Invalid data" })
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


exports.changePassword=asyncHandler(async function (req,res){
    const user = await model.User.findById(req.user._id)
    const {oldpassword,password}=req.body
    if(!user){
        res.send({status:400,mssg:"user not found ,please login"})
    }
    //validate
    if(!oldpassword || !password){
        res.send({status:200,mssg:"please add old and new Password"})
    }

    //if check password in db 
    const passwordIsCorrect=await bcrypt.compare(oldpassword,user.password)
    if(user && passwordIsCorrect){
        user.password=password
        await user.save()
        res.send({status:200,mssg:"Password change Successfully"})
    }else{
        res.send({status:400,mssg:"Old password incorrect"})
    }
})


exports.forgetPassword=asyncHandler(async function(req,res){
    const{email}=req.body

    const user=await model.User.findOne({email})
    // console.log("--------User---------",user)
    if(!user){
        res.send({status:404,mssg:"User does not exist"})
    }

        //Delete token if it exists in DB
        
        let token=await Token.findOne({userId:user._id})
        if(token){
            await token.deleteOne()
        }

        let resetToken=crypto.randomBytes(32).toString("hex") + user._id
        console.log(resetToken)
        const hashedToken=crypto.createHash("sha256").update(resetToken).digest('hex')
        // console.log("hashedToken",hashedToken)
        
        //Save Token to DB
         
        await new Token({
            userId:user._id,
            token:hashedToken,
            createdAt:Date.now(),
            expriesAt:Date.now() + 30 *(60 *1000)   //// 30mintus
        }).save()

        //Construct Reset Url


        const resetUrl=`http://localhost:4444/resetpassword/${resetToken}`
        // console.log("resetUrl",resetUrl)
        ///Reset Email

        const message=`<h2> Hello ${user.name}<h2>
        <p> please use the url below to reset your password </p>
        <p> This reset link is valid for only 30mintues.</p>
        
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

        <p>Regards ...</p>
        <p> Teams for Inventory </p>
        
        `;
        const subject='Password Reset request'
        // const send_to=user.email
        // const send_from="ajithsanjay188@gmail.com"

        try{
            // await sendmail.sendEmail(send_to,message,subject)
            res.send({status:true,mssg:"Reset Email Sent",resetToken:resetToken}) //sample check for resetpassword -get the resetToken
        }catch(err){
            res.send({status:500,mssg:"Email Not sent, please try again"})
        }

        // res.send("Forget password")
})


exports.resetPassword=asyncHandler(async(req,res)=>{
    const {password,resetToken}=req.body

    if (password.length < 6) {
        res.send({ status: 400, message: "Password must be up to 6 characters" })
    }
    const hashedToken=crypto.createHash("sha256").update(resetToken).digest('hex')
    // console.log("hashedToken",hashedToken)
    const userToken=await Token.findOne({
        token:hashedToken,
        expriesAt:{$gt:Date.now()}
    })
    if(!userToken){
        res.send({status:404,mssg:"Invalid or Expired Token"  })
    }
    //find user
    const user=await model.User.findOne({_id:userToken.userId})
    user.password=password
    await user.save()
    res.send({status:200,mssg:"Password Reset Successfully, Please Login"})
})