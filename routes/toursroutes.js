const express = require('express') ; 
const tourController = require('../controllers/tourController') ; 
const authController = require('../controllers/authController')
const router = express.Router() ;

// router.param('id' , tourController.checkid) ; 

router
    .route('/')
    .get(authController.protect ,tourController.getalltours)
    .post(tourController.createtour);
router
    .route('/toptours')
    .get(tourController.ourtoptours , tourController.getalltours) ; 

router
    .route('/tourstats')
    .get(tourController.gettourstats) ;

router
    .route('/monthlyplan/:year')
    .get(tourController.getmonthlyplan) ;     

router
    .route('/:id')
    .get(tourController.gettour)
    .patch(tourController.updatetour)
    .delete(tourController.deletetour);

    module.exports = router ; 