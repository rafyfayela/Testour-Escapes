const User = require('../models/userModel') ; 
const catchAsync = require('../utils/catchAsync') ;
const jwt = require('jsonwebtoken') ; 

exports.signup = catchAsync( async ( req , res , next) => {
    const newUser = await User.create({
        name  : req.body.name , 
        email  : req.body.email , 
        password  : req.body.password , 
        passwordConfirm  : req.body.passwordConfirm 
    }) ; 

    const token = jwt.sign({id: newUser._id} , process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRESIN
    })

    res.status(201).json({
        status : 'succes' , 
        token , 
        data : {
            user : newUser
            }
    })
});