const fs=require('fs') ;
const Tour = require('../models/tourModel') ; 
const { join } = require('path');
const APIfeatures = require('../utils/apiFeatures') ; 
const catchAsync = require('../utils/catchAsync') ; 
const AppError = require('../utils/appError') ; 
const factory = require('./handlerFactory') ;
const multer = require ('multer') ; 
const sharp = require('sharp');
 


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

const multerStorage = multer.memoryStorage() ; 

const multerFilter = (req,file,cb) => {
  if (file.mimetype.startsWith('image')){
      cb(null , true )
  }
  else {
      cb(new AppError('Not an image ! Please upload only images .',400), false)
  }
}

const upload = multer({
  storage: multerStorage , 
  fileFilter : multerFilter 
}) ;

exports.uploadTourImages = upload.fields([
  {name : 'imageCover' , maxCount:1 } ,
  {name : 'images' , maxCount: 15  }
])

exports.resizeTourPhoto = catchAsync(async (req, res, next) => {
  try {
    if (!req.files.imageCover || !req.files.images) return next();

    // Process cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);

    // Process additional images
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
      })
    );

    next();
  } catch (err) {
    console.error('Error processing images:', err);
    next(err);
  }
});


exports.ourtoptours = async (req,res,next) =>{
req.query.limit= 5 ; 
req.query.sort = '-ratingsAverage,price';
req.query.fields = 'name,price,ratingsAverage,summary,difficulty' ; 
next() ; 
};


exports.getalltours = factory.getAll(Tour) ;  
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

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
  
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    });
  });

  exports.getDistance = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });