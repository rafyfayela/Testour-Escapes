const express = require('express') ;
const app = express()  ; 
const morgan = require('morgan') ; 




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


const tourRouter = require('./routes/toursroutes') ; 
const userRouter = require('./routes/usersroutes') ; 



app.use('/api/v1/tours' , tourRouter);
app.use('/api/v1/users' , userRouter);

module.exports = app ; 
