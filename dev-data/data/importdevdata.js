const mongoose = require('mongoose'); 
const dotenv = require ('dotenv') ; 
const fs = require ('fs') ; 
const Tour = require ('../../models/tourModel') ; 
const Review = require ('../../models/reviewModel') ; 
const User = require ('../../models/userModel') ; 
dotenv.config({path:'./config.env'}) ;
const DB = process.env.DATABASE_LOCAL ; 
mongoose.connect(DB , )
.then(() => {
    console.log('DB connection successful!');
}).catch(err => {
    console.error('DB connection error:', err);
});


//  reading json file : ------------------------------------------------------------------
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8')) ;  
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8')) ; 
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8')) ; 
// import data to db  : 
const importdata = async ()=> {
    try {
        await Tour.create (tours) ;  
        await Review.create (reviews) ;  
        await User.create (users) ;  
        console.log('data succefully loaded ! ')
        
    }
    catch (err) {
        console.log (err) ; 
    }
    process.exit() ; 
}
//  delete all data from DB : ---------------------------------------------------------------
const deletedata = async ()=> {
    try {
        await Tour.deleteMany() ; 
        await Review.deleteMany() ; 
        await User.deleteMany() ; 
        console.log('data succefully deleted ! ')
        process.exit() ; 
    }
    catch (err) {
        console.log (err) ; 
    }
}

if (process.argv[2]=== "--import") {
    importdata() ; 
} else if ( process.argv[2]=== "--delete") {
    deletedata () ; 
}
