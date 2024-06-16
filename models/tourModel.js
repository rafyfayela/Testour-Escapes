const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema ({
    name :  {
        type : String , 
        required : [true , 'A tour have a name ! '] , 
        unique : true , 
        trim : true 
    } , 
    maxGroupSize :  { 
        type : Number , 
        required : [true , 'A Group must have a Size !'] 
    } , 
    difficulty :  { 
        type : String , 
        required : [true , 'A tour must have a difficulty !'] 
    } ,
    ratingsAverage :  {
        type : Number ,
         default : 4.5 
    } , 
    ratingsQuantity :  {
        type : Number ,
         default : 0 
    } ,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
      },
    price : {
        type : Number , 
        required : [true , 'A tour have a price ! ']
    } , 
    priceDiscount : {
        type : Number
    } , 
    summary : {
        type : String , 
        trim : true 
    } , 
    description : {
        type: String , 
        trim : true 
    } , 
    imageCover : { 
        type : String , 
        required : [true , "A tour must have a cover image ! "]
    } , 
    images : [String],
    createdAt : {
        type : Date , 
        default : Date.now () , 
        select : false
    } , 
    startDates : [Date]

})
const Tour = mongoose.model('Tour' , tourSchema) ; 
module.exports = Tour ; 