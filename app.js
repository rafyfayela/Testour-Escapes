const express = require('express') ;
const app = express()  ; 
const morgan = require('morgan') ; 
const rateLimit = require('express-rate-limit') ; 
const AppError = require('./utils/appError') ; 
const globalErrorHandler = require('./controllers/errorController') ; 
const helmet = require('helmet') ; 



// 1) middlewares :  ------------------------------------------------------------------------------------
// security http header :
app.use(helmet()) ;

// logging dev mod : 
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'developement') {
app.use(morgan('dev')) ; 
}


// limit request 
const limiter = rateLimit({
    max : 150 , 
    windowMs : 60*60*1000 , 
    message : 'Too many requests from this IP , please try again later ! '
})

app.use('/api',limiter); 


//  body parser , reading data from body into req.body
app.use(express.json()) ; 
// serving static files 
app.use(express.static('./public/'));

// test middleware 

app.use((req,res,next)=>{
    req.requesttime = new Date().toISOString() ; 
    next() ;
})

// 2 : Routes 

const tourRouter = require('./routes/toursroutes') ; 
const userRouter = require('./routes/usersroutes') ; 



app.use('/api/v1/tours' , tourRouter);
app.use('/api/v1/users' , userRouter);

app.all('*',(req,res,next)=>{

next(new AppError(`cant find ${req.originalUrl} on this server!` , 404)) ;

})

app.use(globalErrorHandler) ; 

module.exports = app ; 
