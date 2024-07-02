const Review = require('../models/reviewModel') ; 
const Tour = require('../models/tourModel') ; 
const User = require('../models/userModel') ; 
const factory = require('./handlerFactory') ;

const catchAsync = require('../utils/catchAsync') ; 
const AppError = require('../utils/appError') ; 

// set user id and tour id inside the review ! 
exports.setTourUserIds = (req,res,next)=>{
    req.body.tour = req.params.tourId ; 
    req.body.user = req.user.id ;
    next();
}
// -----------------------------------------

exports.deletereview = factory.deleteOne(Review) ; 
exports.updatreview = factory.updateOne(Review) ;
exports.createreview = factory.createOne(Review) ;
exports.getreview = factory.getOne(Review) ; 
exports.getallreviews = factory.getAll(Review) ; 


