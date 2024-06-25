const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs') ; 
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
        validate : [validator.isEmail , 'Please use a valid Email ! ']
    },
    password : {
        type : String ,
        required : [true , 'Please provide us with a password !'] ,
        minlength : 8 , 
         
    },
    passwordConfirm : {
        type : String , 
        required : [true , 'Please confirm your password ! '] ,
        validate : {
            // only works on create and save 
            validator : function(el){
                return el === this.password ; 
            } , 
            message : 'Passwords are not the same! '
            
        }
    },
    photo : {
        type : String , 
    }    

}) ;


userSchema.pre('save', async function(next) {
    // Only run function if password was modifiedd
    if (!this.isModified('password')) return next();

    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword , userPassword ) {
    return await bcrypt.compare(candidatePassword , userPassword) ; 
}; 



const User = mongoose.model('User',userSchema) ; 
module.exports = User ; 