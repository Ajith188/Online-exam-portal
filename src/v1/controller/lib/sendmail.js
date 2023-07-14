const nodemailer=require('nodemailer')
const config=require('../../../../config.json')
const mailgun = require('mailgun-js')({ apiKey:config.mail.key, domain: config.mail.domain});	



// const sendEmail=async function(subject,message,send_to,send_from,reply_to){
//     const transporter=nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 587,
//         auth:{
//             user:"nomail2406@gmail.com",
//             pass:"Naveen@624",
//         },
//         tls: {
//             rejectUnauthorized: false
//         }
//     })
// console.log( "-------------transporter----------cls",transporter)
// // return
//     const options={
//         from:"murugavelajith199@gmail.com",
//         to:send_to,
//         // replyId:reply_to,
//         subject:subject,
//         html:message
//     }
//     console.log(options)
//     // return

//     //send email
//     await transporter.sendMail(options,function(err,info){
//         console.log("--------27-----",info)
//         if(err){
//             console.log(err)
//         }else{
//             console.log(info.response)
//         }
//     })
// }


// module.exports={sendEmail}


exports.sendEmail = async function(send_to,message,subject,att1=null,att2=null,cc=null,bcc=null) {
    return new Promise(async function(resolve, reject) {
        let data = {
            from: config.mail.from,
            "h:Sender":config.mail.from,
            to: send_to,
            subject: subject,
            html:message
        };
        // console.log("mail",data)
        if(cc) data.cc = cc
        if(bcc) data.bcc = bcc
        if(att1) {
            data.attachment = []
            data.attachment.push(new mailgun.Attachment(att1))
        }
        if(att2) data.attachment.push(new mailgun.Attachment(att2))
        
        
        await mailgun.messages().send(data, async function (error, body) {
            if(error) {
                console.log(error)
                resolve(false)
            } else {
                console.log('Sent');
                resolve(true)
            }
        });
    });
}