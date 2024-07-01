const fs=require('fs') ;
const Tour = require('../models/tourModel') ; 
const { join } = require('path');
const APIfeatures = require('../utils/apiFeatures') ; 
const catchAsync = require('../utils/catchAsync') ; 
const AppError = require('../utils/appError') ; 
const factory = require('./handlerFactory') ;


// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json')) ; 

// exports.checkid = (req,res,next,val) => {
//     console.log(`tour id is : ${val}`) ; 
//     if(req.params.id * 1 > tours.length - 1) {
//         return res.status(404).json({
//             status : 'fail' ,
//             message :'id not valid ! '
//     })
//     }
//     next();
// }

// exports.checkbody = (req,res,next) => {
// if (!req.body.name || !req.body.price) {
//     res.status(400).json({
//         status : 'fail' ,
//         message : 'missing name or price'
//     })
// }
// next();
// }

exports.ourtoptours = async (req,res,next) =>{
req.query.limit= 5 ; 
req.query.sort = '-ratingsAverage,price';
req.query.fields = 'name,price,ratingsAverage,summary,difficulty' ; 
next() ; 
};


exports.getalltours = catchAsync (async (req,res,next)=>{
     
            const features = new APIfeatures(Tour.find() , req.query)
            .filter()
            .sort()
            .fields()
            .pagination() ; 
            const tours = await features.query ; 
            res.status(200).json({
            status : 'success',
            result : tours.length , 
            data : {
                tours
            }
            })
    
    
}) ; 
exports.gettour = factory.getOne(Tour, [
    { path: 'reviews' },
    { path: 'owner', select: 'name' },
    { path: 'guides', select: 'name phone' }
])
exports.createtour = factory.createOne(Tour) ;
exports.updatetour = factory.updateOne(Tour) ;
exports.deletetour = factory.deleteOne(Tour) ;


exports.gettourstats = catchAsync (async (req, res,next) => {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
          $group: {
            _id: { $toUpper : '$difficulty'},
            numTours : {$sum : 1} , 
            numRatings : {$sum : '$ratingsQuantity'} , 
            avgRatings: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        } , 
        {
            $sort : {avgPrice : 1 } 
        } 
        // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    
      ]);
      res.status(200).json({
        status: 'success',
        data: {
          stats : stats
        }
      }); 
  });

  exports.getmonthlyplan = catchAsync (async (req,res,next) => {
        const year = req.params.year * 1 ; 
        const plan = await Tour.aggregate ([
            {
                $unwind : '$startDates'
            } ,
            {
                $match: {
                  startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                  }
                }
            }, 
            {
                $group : {
                    _id: { $month : '$startDates'},
                    numTours : {$sum : 1} , 
                    tours : {$push : '$name'} , 
                }
            },
            {
                $addFields: {
                    month : '$_id'
                } 
            },
            {
                $project : {
                    _id : 0  , 
                    
                }
            },
            {
                $sort : {
                    month : 1 
                }
            } , 
            // {
            //     $limit : 12 
            // }

        ]);
        res.status(200).json({
            status: 'success',
            data: {
               plan
            }
          });
    
  });