const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true , 'Please tell us your name!']
    } , 
    email : {
        type : String,
        unique : true , 
        required : [true , 'Email is required !'] , 
        lowercase : true ,
        validator : [validator.isEmail , 'Please use a valid Email ! ']
    },
    password : {
        type : String ,
        required : [true , 'Please provide us with a password !'] ,
        minlength : 8 , 
    },
    passwordConfirm : {
        type : String , 
        required : [true , 'Please confirm your password ! '] ,
    },
    photo : {
        type : String , 
    }    


})

const User = mongoose.Schema('User',userSchema) ; 
module.exports = User ; 