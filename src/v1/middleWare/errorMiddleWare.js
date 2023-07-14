const errorHandler=(err,req,res,next)=>{
    console.log(req)
    const statusCode=res.statusCode ? res.statusCode : 500
    res.status(statusCode)

    res.json({message:err.message,
    stack:"Inventory" ? err.stack :null})
    // next()
}

module.exports=errorHandler