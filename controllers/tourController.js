const fs=require('fs') ;
const Tour = require('../models/tourModel') ; 
const { join } = require('path');
const APIfeatures = require('../utils/apiFeatures') ; 


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


exports.getalltours = async (req,res)=>{
     try {
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
    }
    catch (err) {
            res.status(404).json({
                status : 'fail',
                message : err
                })
    }
}

exports.gettour = async (req,res)=>{
    try {
        const tour = await Tour.findById(req.params.id) ; 
        res.status(200).json({
            status : 'success',
            data : {
                tour
            }
            })

    }
    catch (err) {
        res.status(404).json({
            status : 'fail',
            message : err
            })
    }
}

exports.createtour = async (req,res)=>{
 
     

       try {
            const newtour = await Tour.create(req.body) ;
            res.status(201).json({
            status : 'success',
            data : {
                tour : newtour 
            }
            })
        }
        catch (err) {
            {res.status(400).json({
                status : 'fail',
                message : "invalid data sent ! "
                })
        }
    }
}


exports.updatetour = async (req,res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id , req.body , {
            new : true, 
            runValidators : true 
        }) ;
        res.status(201).json({
        status : 'success',
        data : {
            tour 
        }
        })
    }

    catch (err) {
        res.status(404).json({
            status : 'fail',
            message : err
            })
    }  

}

exports.deletetour = async (req,res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id) ;
        res.status(204).json({
        status : 'success',
        data : null 
        })
    }

    catch (err) {
        res.status(404).json({
            status : 'fail',
            message : err
            })
    }  

}


exports.gettourstats = async (req, res) => {
    try {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
          $group: {
            _id: null,
            avgRatings: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]);
      res.status(200).json({
        status: 'success',
        data: {
          stats : stats
        }
      });
    } catch (err) {
        console.log(err);
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };