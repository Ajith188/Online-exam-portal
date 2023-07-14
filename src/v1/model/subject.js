var mongoose = require('mongoose')

var subjectSchema = new mongoose.Schema({
  name : {
    type : String,
    required:[true,"please Add a name"]
    // unique : true
  },
  status : {
    type : String,
    enum : ['activeSubject', 'blockedSubject',"unblockedSubject"],
    // required:[true,"please Add a status"],
    default : "activeSubject"
  },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'adminModel'
  }
},
{
  timestamps : {}
})


const subject=mongoose.model('subject',subjectSchema)
module.exports={
    subject
}