var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var Sequelize = require('sequelize');
var validationError = Sequelize.ValidationError;

var config = require('../config');

var services = require('../services');



var jwt = require('jsonwebtoken');


router.use(bodyParser.json());


router.post('/singup',function(req,res,next){
	services.auth.registerUser(
		req.body.username,
		req.body.email,
		req.body.password,
		req.body.repeatedPassword)
	.then(message => {
		res.json({message:message});
	})
	.catch(err => {		
		res.status(err.status).json(err);
	});
});

router.get('/singup',function(req,res,next){
	res.render('auth/singup',{
		title:'Sing Up'
	});
});

router.post('/singin',function(req,res,next){
	services.auth.loginUser(req.body.username,req.body.password)
	.then(data=>res.send(data))
	.catch(err=>res.status(err.status).send(err.message));	
});

router.get('/singin', function(req,res,next){
	res.render('auth/singin',{
		title:'Sing In'
	});
});

router.get('/validate',function(req,res,next){
	jwt.verify(
		req.get('Authorization'),
		config.secretAuth,
		function(err,decode){
			if(err){
				res.status(400).json(err);
			}else{
				res.json({message:'Token válido'});
			}
		}
	);
});

router.get('/refresh',function(req,res,next){
	var accessToken = req.query.accessToken;
	var refreshToken = req.query.refreshToken;	

	jwt.verify(
		refreshToken,
		config.secretAuth,
		function(err,decode){
			if(err){
				res.status(400).send(err.message);
			}			
			else if(decode.access_token==accessToken){
				res.status(400).send('Invalid accessToken');
			}
			else{				
				jwt.verify(accessToken,config.secretAuth,
					{ignoreExpiration:true},
					function(err,decode){
					if(err){
						res.status(400).send('Invalid accessToken');		
					}else{
						services.auth.getAuthTokens({
							username : decode.username,
							email : decode.email,
						})
						.then((at,rt)=>{
							res.json({
								token_type:'jwt',
								access_token : at,
								refresh_token : rt,
							});
						})
						.catch(err => {
							res.status(500).send(err);
						});
					}
				});				
			}
		});
});

router.post('/changePassword',(req,res,next)=>{
	services.auth.changePassword(
		req.get('Authorization'),
		req.body.password)
	.then(()=>{
		res.json({message: "Password updated"});
	})
	.catch(err=>{
		console.log(err);
		res.status(err.status).json({message:err.message});
	});
});

router.get('/changePassword',(req,res,next)=>{
	res.render('auth/changePassword',{
		title:"Change Password"
	});
});

module.exports = router;