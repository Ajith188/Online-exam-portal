var mongoose = require("mongoose");
const bcrypt=require('bcrypt')

var adminSchema = new mongoose.Schema({
  username : {
    type : String,
    required:[true,"please Add a username"]
  },
  password : {
    type : String,
    required:[true,"please add a password"],
    minLength:[6,"Password must be up to 6 characters"]
  }
},{
  timestamps:{}
})


adminSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }
    
    const salt=await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash( this.password,salt)
    this.password=hashedPassword
    next()
})

const Admin=mongoose.model('Admin',adminSchema)
module.exports={
    Admin
}

