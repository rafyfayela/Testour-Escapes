const User = require('../models/userModel') ;
const catchAsync = require('../utils/catchAsync') ; 


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

exports.updateuser = (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'route is not defined yet ! '
    })
}

exports.deleteuser = (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'route is not defined yet ! '
    })
}