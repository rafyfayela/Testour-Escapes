const {promisify} = require ('util') ; 
const User = require('../models/userModel') ; 
const catchAsync = require('../utils/catchAsync') ;
const jwt = require('jsonwebtoken') ; 
const AppError = require('../utils/appError') ;
const Email = require('../utils/email') ;
const crypto = require('crypto') ;  

const signToken = id => {
    return jwt.sign({id} , process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRESIN
})
} ; 

const createSendToken = (user , statusCode , res) => {
    const token = signToken(user._id) ; 
    const cookieOption = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRESIN * 24 * 60 * 60 *1000 ) , 
        // secure : true ,  handled in if 
        httpOnly: true 
    }
    if(process.env.NODE_ENV === 'production') cookieOption.secure = true ; 
    
    res.cookie('jwt', token , cookieOption) ; 

    user.password = undefined ; 
     
    res.status(statusCode).json({
        status : 'success' , 
        token , 
        data : {
            user
            }
    })
}

exports.signup = catchAsync( async ( req , res , next) => {
    console.log(req.body);
    const newUser = await User.create({
        name  : req.body.name , 
        email  : req.body.email , 
        password  : req.body.password , 
        passwordConfirm  : req.body.passwordConfirm  ,
        role : req.body.role , 
        phone : req.body.phone,
        
    }) ; 
    const url = `${req.protocol}://${req.get('host')}/api/v1/users/me` ;
    console.log(url) ;  
    await new Email(newUser,url).sendWelcome() ; 
    createSendToken(newUser,201,res) ; 
   
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
   createSendToken(user,200,res) ; 
   
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

exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError ('You dont have permission to perfom this action ! ' , 403)) ; 
        }
        next() ; 
    };
};

exports.forgotPassword = catchAsync( async(req,res,next)=>{
    // get user based on posted email : 
    const user = await User.findOne({email : (req.body.email)}) ;
    if (!user) {
        return next(new AppError('There is no user linked with this email address !' , 404)); 
    }
    // generate the random reset token :
    
    const resetToken = user.createPasswordResetToken() ;        
    await user.save({validateBeforeSave:false}) ; 
    
    try {
    
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}` ;   
        
        await new Email(user, resetURL).sendResetPassword(); 
    
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    
        return next(
          new AppError('There was an error sending the email. Try again later!'),
          500
        );
      }
      
});

exports.resetPassword =  catchAsync(async (req,res,next) => {
            // get the user based on the token : 
            const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex') ;
            const user = await User.findOne({passwordResetToken : hashedToken , 
                passwordResetExpires : {$gt : Date.now()}});  

            // if the token is not expired and the user exists , set a new password : 
                if (!user) { 
                    return next(new AppError('Token is either invalid or expired ! ',400  ))
                }   
                
                
            //  update the new password property
                user.password = req.body.password ;
                user.passwordConfirm = req.body.passwordConfirm ;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save() ;
                
            // log the user in , send jwt 
            createSendToken(user,200,res) ; 
}) ; 

exports.updatePassword =  catchAsync(async(req , res , next ) => {
        // get user from collection : 
        const user = await User.findById(req.user.id).select('+password') ; 
        // check if posted user password is correct 
 if(!user || !(await user.correctPassword(req.body.passwordCurrent , user.password))) {
        return next(new AppError ('Your current password is wrong !' , 401)) ; 
    }
        // if so update password 
        user.password = req.body.password ;
        user.passwordConfirm = req.body.passwordConfirm ;
        await user.save() ;

        // log user in sent jwt 
        createSendToken(user,200,res) ; 
        
}) ; 

