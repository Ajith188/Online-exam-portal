const mongoose=require('mongoose')

const tokenSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"user"
    },
    token:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        required:true,
    },
    expriesAt:{
        type:Date,
        required:true,
    }
})


const token=mongoose.model("Token",tokenSchema)

module.exports=token