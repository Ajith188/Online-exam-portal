var mongoose = require('mongoose');
const bcrypt=require('bcrypt')

var userTechSchema = new mongoose.Schema({
  username : {
    type : String,
    required:[true,"please Add a username"]
  },
  email : {
    type : String,
    required:[true,"please Add a email"],
    unique:true,
    trim:true,
    match:[
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,"Please enter a valid email"
    ]
  },
  usertype : {
    type : String,
    enum : ['TEACHER', 'STUDENT'],
    required:[true,"please Add a usertype"]
  },
  password : {
    type : String,
    required:[true,"please add a password"],
    minLength:[6,"Password must be up to 6 characters"]
  },
  // status : {
  //   type : Boolean,
  //   default : true
  // },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'adminModel'
  }

},
{
  timestamps:{}
})



userTechSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }
    
    const salt=await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash( this.password,salt)
    this.password=hashedPassword
    next()
})

const userTech=mongoose.model('userTech',userTechSchema)
module.exports={
    userTech
}

