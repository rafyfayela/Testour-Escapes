const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController') ; 
const router = express.Router();

router.post('/signup',authController.signup) 
router.post('/login',authController.login) 
router.get('/me' , authController.protect , userController.getMe , userController.getuser ) ; 


router.post('/forgotPassword',authController.forgotPassword) ;
router.patch('/resetPassword/:token',authController.resetPassword) ;
router.patch('/updateMyPassword',authController.protect , authController.updatePassword) ;
router.patch('/updateMe',authController.protect ,userController.uploadUserPhoto , userController.resizeUserPhoto ,userController.updateMe) ; 
router.delete('/deleteMe',authController.protect , userController.deleteMe) ; 

router
.route('/')
    .get(authController.protect ,authController.restrictTo('Admin'), userController.getallusers)
    .post(userController.createuser);

router
    .route('/:id')
    .get(authController.protect ,authController.restrictTo('Admin'),userController.getuser)
    .patch(authController.protect ,authController.restrictTo('Admin','Staff'), userController.updateuser)
    .delete(authController.protect ,authController.restrictTo('Admin'), userController.deleteuser);

module.exports = router;
