var express= require('express');
var router = express.Router();

var Client = require('node-rest-client').Client;
var jsonwebtoken= require('jsonwebtoken');

var client = new Client();

var serviceUnavailable = "This service is temporary unavailable, Try again later!";
//============================================================================================

//routes Authentication service


var Ind = require('../models/Individual.js');
var Company = require('../models/Companies.js');
var Company2 = require('../models/Company2.js');
var User = require('../models/Users.js');


var Sub = require('../models/Sub.js');
var Emailer = require('../models/Emailer.js');

//All routes after this middleware are secured
Ind.methods(['get','post']);//white and read only access
Ind.register(router,'/individualDonations');

Company.methods(['get','post']);
Company.register(router,'/companyDonations');

Company2.methods(['get','post']);
Company2.register(router,'/company2Donations');






router.get("/test",function(req,res){
    res.send({message: "Ou! yeh reg and auth is working"})
})

router.post("/publishNewsLeter",function(req,res){
	
});

router.post("/subscribe",function(req,res){
	var newSubscriber = new Sub({
		name: req.body.name,
		cellphone:req.body.cellphone,
		email:req.body.email
	});

	newSubscriber.save(function(saved){
		      var email = newSubscriber.email; 

			  Emailer.sendNotification(Emailer.getMailOptions(email,"Subscription Notification",
			    "Hi "+newSubscriber.name+"<br><br>Thank you for subscribing for news letters of Buy a brick charlity!, From now on you will be recieving all news letter regarding charlity."+
			    "<br>Yours<br> Mr. Welldone Goodman"));
	        res.send(saved);
		})

})







// this method creates a jsonwebtoken

function createToken(user){

	var token=	jsonwebtoken.sign({
				name : user.name,
				email : user.email
		},"iofioeifoeopfoifuieifeheiuufueueuhfueuuduejdj89282289281",{expiresIn : 3600}
	);

	return token;
}
router.get("/test",function(req,res){
    res.send({message: "Ou! yeh reg and auth is working"})



})


router.post('/signup',function(req,res){
    var user = new User({

        lastName: req.body.lastName,
        firstName: req.body.firstName,
        email: req.body.email,
        password:req.body.password,
        company: req.body.company,
        role: req.body.role 

    });

    console.log(user);

    user.save(function(err,usr){
        var token = createToken(user);
        
        if(err){
            res.send(err); return;
        }

                
        
        res.status(200).send({
            success: true,
            token:token,
            userId: usr._id,
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            email: req.body.email,
            role: req.body.role 

        });
    });
});



router.post('/login',function(req,res){

    User.findOne({ email : req.body.email}).select('password').exec(function(err,user){

        if(err) throw err;
        if(!user){
            res.send({
                success:false,
                message:"User does not exists!"
            });
        }else if(user){
            var validPassword=user.comparePassword(req.body.password);

            if(!validPassword){
                    res.send({
                        success:false,
                        message: "incorrect email or password!"
                    }) 
            }
            else{
                var token = createToken(user);

                
                User.findOne({ email : req.body.email},function(err,user){
                    console.log(user);
                    res.status(200).send({
                        success: true,
                        token:token,
                        userId: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email:user.email,
                        role: user.role 

                    });


                })
            }
        }
    });
})



//All routes after this middleware are secured
User.methods(['get','put','delete']);
User.register(router,'/users');

module.exports=router;