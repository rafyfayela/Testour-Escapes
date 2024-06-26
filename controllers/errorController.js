const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
    const message = `invalid ${err.path} : ${err.value}` ; 
    return new AppError (message , 400) ; 
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/['"](.*?[^\\])['"]/)[0];
    // console.log(value) ; 
    const message = `Duplicate field value : ${value} please use another value ! .`;
    return new AppError(message , 400) ; 
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el=> el.message) ;
    const message = `Invalid Input data . ${errors.join('. ')}`  ; 
    return new AppError(message , 400) ; 
}

const handleJWTError = () => new AppError('Invalid token. Please log in again !' , 401 ) ; 
const handleTokenExpiredError = () => new AppError('Token has been expired ! Please log in again .' , 401 ) ; 


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
        let error = Object.assign(err, {});
        if(error.name === 'CastError') error = handleCastErrorDB(error) ; 
        if(error.code === 11000) error = handleDuplicateFieldsDB(error) ; 
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error) ; 
        if(error.name === 'JsonWebTokenError') error = handleJWTError() ; 
        if(error.name === 'TokenExpiredError') error = handleTokenExpiredError() ; 
        sendErrorProd(error,res) ;  

    }
    
}