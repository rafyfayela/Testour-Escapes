const express = require('express') ;
const app = express()  ; 
const morgan = require('morgan') ; 
const AppError = require('./utils/appError') ; 
const globalErrorHandler = require('./controllers/errorController') ; 



// 1) middlewares :  ------------------------------------------------------------------------------------
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'developement') {
app.use(morgan('dev')) ; 
}
app.use(express.json()) ; 
app.use(express.static('./public/'));
app.use((req,res,next)=>{
    console.log('hello from the middleware!');
    next(); 
})
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
