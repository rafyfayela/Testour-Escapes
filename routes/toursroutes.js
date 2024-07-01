const express = require('express') ; 
const tourController = require('../controllers/tourController') ; 
const authController = require('../controllers/authController') ; 
const reviewroutes = require('../routes/reviewroutes') ;
const router = express.Router() ;

// router.param('id' , tourController.checkid) ; 

router
    .route('/')
    .get(authController.protect ,tourController.getalltours)
    .post(authController.protect ,authController.restrictTo('Owner', 'Admin' , 'Staff') ,  tourController.createtour);
router
    .route('/toptours')
    .get(tourController.ourtoptours ,  tourController.getalltours) ; 

router
    .route('/tourstats')
    .get(tourController.gettourstats) ;

router
    .route('/monthlyplan/:year')
    .get(tourController.getmonthlyplan) ;     

router
    .route('/:id')
    .get(tourController.gettour)
    .patch(authController.protect ,authController.restrictTo('Owner', 'Admin' , 'Staff') , tourController.updatetour)
    .delete(authController.protect ,authController.restrictTo('Owner', 'Admin' , 'Staff') , tourController.deletetour);


    // ------------------------------------------------------------------------------------------------------------------------

router.use('/:tourId/reviews', reviewroutes )

    module.exports = router ; 