const sendErrorDev = (err,res)=> {
    res.status(err.statusCode).json({
        status : err.status , 
        error : err , 
        message : err.message ,
        stack : err.stack , 
    }) ; 
}
const sendErrorProd = (err,res)=> {
    // operational trusted errors : send message to client 
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status : err.status , 
            message : err.message 
        }) ;
    }
    // programming or other unknown errors : trying to not leak details ! 
    else {
                //  log error : 
        console.error('ERRORRRRRRRRR !' , err ) ;         

                // send message : 
        res.status(500).json({
            status : 'error' , 
            message : 'something went very wrong ! ' 
        }) ;
    }
}; 






module.exports = (err,req,res,next)=>{
    // console.log(err.stack) ; 
    err.statusCode = err.statusCode || 500 ; 
    err.status = err.status || 'error' ; 
    if(process.env.NODE_ENV === 'developement') {
        sendErrorDev(err,res);
    }
    else if (process.env.NODE_ENV === 'production') {
        sendErrorProd(err,res) ; 
    }
    
}