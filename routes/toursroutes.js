const express = require('express') ; 
const tourController = require('../controllers/tourController') ; 
const router = express.Router() ;

// router.param('id' , tourController.checkid) ; 

router.route('/toptours').get(tourController.ourtoptours , tourController.getalltours) ; 


router
    .route('/')
    .get(tourController.getalltours)
    .post(tourController.createtour);
router
    .route('/:id')
    .get(tourController.gettour)
    .patch(tourController.updatetour)
    .delete(tourController.deletetour);

    module.exports = router ; 