const mongoose = require('mongoose');
const slugify = require('slugify') ; 
const validator = require('validator') ; 
const tourSchema = new mongoose.Schema ({
    name :  {
        type : String , 
        required : [true , 'A tour have a name ! '] , 
        unique : true , 
        trim : true , 
        maxLength : [25 , 'A tour name maximum length is 25'] , 
        minLength : [5 , 'A tour name minimum length is 3'] , 
        // validate : [validator.isAlpha , 'A tour name must contain only characters !']
    } , 
    Slug : String , 
    maxGroupSize :  { 
        type : Number , 
        required : [true , 'A Group must have a Size !'] 
    } , 
    difficulty :  { 
        type : String , 
        required : [true , 'A tour must have a difficulty !']  ,
        // enum works with strings only ! 
        enum : {
            values : ['easy','medium','difficult'] ,
            message : 'difficulty is either easy , medium or difficult !'
        }
    } ,
    ratingsAverage :  {
        type : Number ,
        default : 4.5 ,
        max : [5 , 'A tour rate maximum is 5.0'] , 
        min : [1 , 'A tour rate minimum  is 1.0']
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
        type : Number , 
        validate : {
            // this only works on creation now but i'll fix it for sure ! 
            validator : function(val) {
                return val < this.price ;
            } ,
            message : 'Discount price ({VALUE}) should be less than the original price !'
        } 
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
    startDates : [Date] , 
    secretTour : {
        type : Boolean , 
        default : false 
    }
 } , {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    } 
)
// Virtual properties 
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7 ; 
}) ; 
// DOCUMENT MIDDLEWARE runs before save and create -----------------------------------------
tourSchema.pre('save', function(next){
    this.Slug = slugify(this.name , {lower : true }) ; 
    next() ; 
}); 

// tourSchema.post('save',function(doc,next) {
//     console.log(doc) ; 
//     next() ; 
// });

// QUERY MIDDLEWARE runs when .find is executed  -----------------------------------------
tourSchema.pre(/^find/ , function(next){
    this.find({secretTour : {$ne : true}}) ; 
    this.start = Date.now() ; 
    next();   
});

// tourSchema.post(/^find/ , function(doc,next){
//     console.log(`this query took ${Date.now() - this.start} milliseconds ! `) ; 
//     console.log(doc); 
//     next();   
// });


//AGGREGATION MIDDLEWARE  -----------------------------------------------------------------

tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({$match : {secretTour : {$ne : true} } }) ; 
    console.log(this.pipeline()) ; 
    next(); 
}) ;

const Tour = mongoose.model('Tour' , tourSchema) ; 
module.exports = Tour ; 