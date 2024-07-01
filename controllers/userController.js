const User = require('../models/userModel') ;
const catchAsync = require('../utils/catchAsync') ; 
const AppError = require('../utils/appError') ;
const factory = require('./handlerFactory') ;



const filterObj = (obj , ...allowedFields) => {
    const newObj = {} ; 
    Object.keys(obj).forEach(el=> {
        if (allowedFields.includes(el)) newObj[el] = obj [el] ; 
    })
    return newObj  ;
}

// update autentificated user ! 
exports.updateMe = catchAsync (async(req,res,next) => {  
    //  create error if user posts password data : 
    if (req.body.password || req.body.passwordConfirm ) {
        return next(new AppError('this routes is not for password update ! please use /updateMyPassword' , 400)) ; 
    }
    // update user document : 
                    // filter unwanted data in the req : 
    const filteredBody = filterObj (req.body , 'name' , 'email' )  ; 
    
    const updatedUser =  await User.findByIdAndUpdate(req.user.id , filteredBody , {
        new : true , 
        runValidators : true 
    })

    res.status(200).json({
        status :"succes" , 
        data : {
            user : updatedUser 
        }
    }); 
}) ; 


exports.deleteMe = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id , {active : false }) ; 
    res.status(204).json({
        status : 'succes' ,
        data : null
    })
}) ; 


exports.getallusers = catchAsync( async (req,res) => {
    const users = await User.find() ; 
    res.status(200).json({
    status : 'success',
    result : users.length , 
    data : {
        users
    }
    })
}) ; 

exports.createuser = (req,res)  =>{
    res.status(500).json({
        status:'error',
        message:'route is not defined yet ! '
    })
}

exports.getuser = (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'route is not defined yet ! '
    })
}

exports.updateuser = factory.updateOne(User) ; 
exports.deleteuser = factory.deleteOne(User) ; 