const express = require('express') ; 
const reviewController = require('../controllers/reviewController') ; 
const authController = require('../controllers/authController')
const router = express.Router({mergeParams:true}) ;


router
.route('/')
    .get( reviewController.getallreviews)
    .post(authController.protect , authController.restrictTo('User','Admin','Staff') 
    , reviewController.setTourUserIds ,  reviewController.createreview);
    
    
router
 .route('/:id')
    .delete(authController.protect ,authController.restrictTo('Owner', 'Admin' , 'Staff') , reviewController.deletereview)
    .patch(authController.protect ,authController.restrictTo('Owner', 'Admin' , 'Staff') , reviewController.updatreview)


module.exports = router  ; 