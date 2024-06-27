const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController') ; 
const router = express.Router();

router.post('/signup',authController.signup) 
router.post('/login',authController.login) 


router.post('/forgotPassword',authController.forgotPassword) 
// router.post('/resetPassword',authController.resetPassword) 

router
.route('/')
    .get(userController.getallusers)
    .post(userController.createuser);

router
    .route('/:id')
    .get(userController.getuser)
    .patch(userController.updateuser)
    .delete(authController.protect ,authController.restrictTo('Admin','Staff'), userController.deleteuser);

module.exports = router;
