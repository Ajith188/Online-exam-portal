const { nextTick } = require('process')
const model=require('../model/user')
const userTech=require('../model/userTech')
const jwt=require('jsonwebtoken')
const asyncHandler=require ('express-async-handler')
exports.Auth= asyncHandler(async function(req,res,next){
    // console.log("token",req)
    try{
        const token=req.cookies.token
        // console.log("token",token)
        if(!token){
            res.send({status:400,mssg:"Not authorized ,please login"})
        }
        ///verify token
        const verified=jwt.verify(token,"damalDumil")
        // console.log(verified)
        //Get user id from token
        user=await model.User.findById(verified.id)
        // console.log("user",user)
        if(!user){
            res.send({status:400,mssg:"User not found"})

        }
        req.user=user
        next()
    }catch(err){
        console.log(err)
        res.json({mssg:err.message})
    }
})

exports.techAuth= asyncHandler(async function(req,res,next){
    // console.log("token",req)
    try{
        const token=req.cookies.token
        // console.log("token",token)
        if(!token){
            res.send({status:400,mssg:"Not authorized ,please login"})
        }
        ///verify token
        const verified=jwt.verify(token,"damalDumil")
        // console.log(verified)
        //Get user id from token
        user=await userTech.userTech.findById(verified.id)
        // console.log("user",user)
        if(!user){
            res.send({status:400,mssg:"User not found"})
        }
        req.user=user
        next()
    }catch(err){
        console.log(err)
        res.json({mssg:err.message})
    }
})
