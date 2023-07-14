const mongoose=require('mongoose')
const express=require('express')
const cors=require('cors')
const fs = require('fs')
const helmet = require('helmet')  /////helmet means for which framework is not visible for this npm package
const errorHandler=require('./src/v1/middleWare/errorMiddleWare')
const cookieParser=require('cookie-parser')
const bodyParser=require('body-parser')
const config=require('./config.json')


const app=express()
app.use(helmet());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin");
    // console.log("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin")
    next();
});

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))


//Error Handler-MiddleWare///
app.use(errorHandler)

let versions = ['v1'];
for(let v of versions) {
    let p = __dirname+'/src/'+v+'/router/';
    fs.readdirSync(p).forEach(file => {
        if(file.includes('js')) {
            let fn = file.replace('.js','');
            app.use('/'+v+'/'+fn, require(p+fn));
        }
    });
}




mongoose.set('strictQuery', false)
const data=mongoose.connect(config.url) 
if(data!=0){
    console.log('MongoDb connected')
}else{
console.log('MongoDb Not connected')   
}



app.listen(config.port ,function(){
    console.log("port running",config.port)
})
