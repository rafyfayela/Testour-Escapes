const crypto = require('crypto') ; 
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
    role : {
        type : String, 
        enum : ['User' , 'Guide' , 'Owner' , 'Admin' , 'Staff'] , 
        default :  'User' , 
    } , 
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
    }   ,
    passwordChangedAt : {
        type : Date 
    } , 
    passwordResetToken : {
        type : String ,
        } ,
    passwordResetExpires : {
        type : Date ,
    } ,
    active : {
        type : Boolean , 
        default : true , 
        select : false , 
    }
        
}) ;


userSchema.pre('save', async function(next) {
    // Only run function if password was modifiedd
    if (!this.isModified('password')) return next();

    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;

    this.passwordChangedAt = Date.now() - 1000;

    next();
});


userSchema.pre(/^find/ , function (next) { 
    this.find({active : {$ne:false} }) ; 
    next() ;     
})


userSchema.methods.correctPassword = async function(candidatePassword , userPassword ) {
    return await bcrypt.compare(candidatePassword , userPassword) ; 
}; 

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        console.log(changedTimestamp , JWTTimestamp) ; 
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
  };

  userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex') ; 
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 ; //10min 
    // console.log({resetToken}, this.passwordResetToken) ; 
    return resetToken ; 
  } 

const User = mongoose.model('User',userSchema) ; 
module.exports = User ; 