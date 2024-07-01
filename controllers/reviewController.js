const Review = require('../models/reviewModel') ; 
const Tour = require('../models/tourModel') ; 
const User = require('../models/userModel') ; 

const catchAsync = require('../utils/catchAsync') ; 
const AppError = require('../utils/appError') ; 


exports.getallreviews = catchAsync (async (req,res,next)=>{

    const review = await Review.find() ; 
    res.status(200).json({
    status : 'success',
    result : review.length , 
    data : {
        review
    }
    })


}) ; 


exports.createreview = catchAsync (async (req,res,next)=>{
    req.body.tour = req.params.tourId ; 
    req.body.user = req.user.id ; 
    const newreview = await Review.create(req.body) ;
    res.status(201).json({
    status : 'success',
    data : {
        tour : newreview
    }
    }) ; 
}) ; 