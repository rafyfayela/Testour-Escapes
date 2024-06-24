const dotenv = require('dotenv') ; 
dotenv.config({path:'./config.env'}) ;
const app = require('./app') ;
const mongoose = require('mongoose');
const DB = process.env.DATABASE_LOCAL ; 
mongoose.connect(DB , )
.then(() => {
    console.log('DB connection successful!');
}).catch(err => {
    console.error('DB connection error:', err);
});



const port = process.env.port || 3000 ; 
const server = app.listen( port , '127.0.0.1' ,  () => {
    console.log(`app runing on port ${port} ...  `)
})


process.on('uhnhandledRejection',err =>{
console.log(err.name , err.message) ; 
console.log('UNHANDLED REJECTION !!! SHUTTING DOWN ... ')
server.close(()=>{
    process.exit(1) ;
}) ; 
 
});