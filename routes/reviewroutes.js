const express = require('express') ; 
const reviewController = require('../controllers/reviewController') ; 
const authController = require('../controllers/authController')
const router = express.Router() ;


router
.route('/')
    .get( reviewController.getallreviews)
    .post(authController.protect , authController.restrictTo('User','Admin') ,  reviewController.createreview);


module.exports = router  ; 