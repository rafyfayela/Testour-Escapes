const express = require('express') ; 
const reviewController = require('../controllers/reviewController') ; 
const authController = require('../controllers/authController')
const router = express.Router({mergeParams:true}) ;


router
.route('/')
    .get( reviewController.getallreviews)
    .post(authController.protect , authController.restrictTo('User','Admin','Staff') ,  reviewController.createreview);


module.exports = router  ; 