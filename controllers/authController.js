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