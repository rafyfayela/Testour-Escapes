const {promisify} = require ('util') ; 
const User = require('../models/userModel') ; 
const catchAsync = require('../utils/catchAsync') ;
const jwt = require('jsonwebtoken') ; 
const AppError = require('../utils/appError') ;

const signToken = id => {
    return jwt.sign({id} , process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRESIN
})
} ; 

exports.signup = catchAsync( async ( req , res , next) => {
    const newUser = await User.create({
        name  : req.body.name , 
        email  : req.body.email , 
        password  : req.body.password , 
        passwordConfirm  : req.body.passwordConfirm 
    }) ; 

    const token = signToken(newUser._id) ; 

    res.status(201).json({
        status : 'succes' , 
        token , 
        data : {
            user : newUser
            }
    })
});

exports.login =  catchAsync (async(req , res , next) => {
    const {email , password} = req.body ; 
    //  1 - check if email and password exists : --------------------------------------------------------------
    if(!email || !password) {
        return next(new AppError ('Please Provide us with Email and Password !' , 400))
    }

    // 2 - check if user exists & password is valid : ----------------------------------------------------------
    const user = await User.findOne({email}).select('+password') ; 
    // console.log(user) ;   
    if(!user || !(await user.correctPassword(password , user.password))) {
        return next(new AppError ('Incorrect Email or Password !' , 401)) ; 
    }


   // 3 - if everything is valid send token : ------------------------------------------------------------------
    const token = signToken(user._id)

    res.status(200).json({
        status : 'succes' ,
        token , 

    }) 
}) ;

exports.protect = catchAsync(async (req,res,next)=>{
    // 1- getting token and checking if it's there : 
    let token ; 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        // console.log(token);
    }

    if(!token) {
        return next(new AppError('You are not Logged In , Please Log in to get access !' , 401)) ; 
    }

    
    
    // 2- Verification token :  

    const decoded = await promisify (jwt.verify)(token , process.env.JWT_SECRET) ; 
    console.log(decoded);

    // 3 : check if user exists : 
    const freshUser= await User.findById(decoded.id) ; 
    if(!freshUser) {
        return next(new AppError('The user belonging to this token does not exist !' , 404 )) ; 
    }

    // 4 : check if user changed password after the token was issued : 

    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(
          new AppError('User recently changed password! Please log in again.', 401)
        );
      }
    
      // Grant acces to protected route : 
      req.user = freshUser ; 

      next();
})