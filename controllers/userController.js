const User = require('../models/userModel') ;
const catchAsync = require('../utils/catchAsync') ; 
const AppError = require('../utils/appError') ;
const factory = require('./handlerFactory') ;
const multer = require ('multer') ; 
const sharp = require('sharp');


// const multerStorage = multer.diskStorage({
//     destination : (req, file , cb)=> {
//         cb(null , 'public/img/users')
//     } , 
//     filename : (req,file,cb)=> {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// }) ; 

const multerStorage = multer.memoryStorage() ; 

const multerFilter = (req,file,cb) => {
    if (file.mimetype.startsWith('image')){
        cb(null , true )
    }
    else {
        cb(new AppError('Not an image ! Please upload only images .',400), false)
    }
}

const upload = multer({
    storage: multerStorage , 
    fileFilter : multerFilter 
}) ;

exports.uploadUserPhoto = upload.single('photo') ; 

exports.resizeUserPhoto =  catchAsync( async (req,res,next)=>{
    if(!req.file) return next() ; 
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg` ;

    await sharp(req.file.buffer).resize(500,500)
                                .toFormat('jpeg')
                                .jpeg({quality:90})
                                .toFile(`public/img/users/${req.file.filename}`) ;

    next();
});



const filterObj = (obj , ...allowedFields) => {
    const newObj = {} ; 
    Object.keys(obj).forEach(el=> {
        if (allowedFields.includes(el)) newObj[el] = obj [el] ; 
    })
    return newObj  ;
}

exports.getMe = (req,res,next) => {
    req.params.id = req.user.id ;
    next() ;
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
    if(req.file) filteredBody.photo = req.file.filename ; 
    
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

exports.createuser = (req,res)  =>{
    res.status(500).json({
        status:'error',
        message:'route is not defined yet ! '
    })
}

exports.getallusers = factory.getAll(User); 
exports.getuser= factory.getOne(User)
exports.updateuser = factory.updateOne(User) ; 
exports.deleteuser = factory.deleteOne(User) ; 