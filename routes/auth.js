var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Sequelize = require('sequelize');
var models = require('../models');
var shajs = require('sha.js');
var config = require('../config');

const Op = Sequelize.Op;

var jwt = require('jsonwebtoken');


router.use(bodyParser.json());


router.post('/singup',function(req,res,next){
	
	models.User.create({
		username : req.body.username,
		email : req.body.email,
		password : shajs('sha256').update(req.body.password).digest('hex'),
	}).then(()=>{
		res.send('Usuario registrado');		
	})
	.catch((err)=>{
		res.status(400).json(err);
	})
});


router.post('/singin',function(req,res,next){	
	

	models.User.findOne({
		where:{
			password:shajs('sha256').update(req.body.password).digest('hex'),
			[Op.or]:[
				{username:req.body.username},
				{email:req.body.username}
				],
		}
	})
	.then(function(user){		
		if(user){		
			
			var payload = {};

			payload.username = user.username;
			payload.email = user.email;		

			var accessToken = jwt.sign(
				payload,config.secretAuth,
				{ expiresIn: 60 });

			var refreshToken = jwt.sign({
				accessToken:accessToken,		
			},config.secretAuth,{ expiresIn: 3600 });

			res.json({
				token_type:'jwt',
				access_token : accessToken,
				refresh_token : refreshToken,
			});

		}
		else{
			res.status(401).send('Nombre de usuario/email o password incorrecto.');
		}
	})
	.catch(function(err){
		res.status(500).send('Error en el servidor');		
	});
});


router.get('/validate',function(req,res,next){
	jwt.verify(req.get('Authorization'),config.secretAuth,
		function(err,decode){
			if(err){
				res.status(400).json(err);
			}else{
				res.status(200).send('Token válido');
			}
		}
	);	
});

router.get('/refresh',function(req,res,next){
	var accessToken = req.query.accessToken;
	var refreshToken = req.query.refreshToken;	

	jwt.verify(refreshToken,
		config.secretAuth,function(err,decode){
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

						var payload = {
							username : decode.username,
							email : decode.email,
						};

						var newAccessToken = jwt.sign(
						payload,config.secretAuth,
						{ expiresIn: 60 });

						var newRefreshToken = jwt.sign({
							accessToken:newAccessToken,		
						},config.secretAuth,{ expiresIn: 3600 });

						res.json({
							token_type:'jwt',
							access_token : newAccessToken,
							refresh_token : newRefreshToken,
						});
					}
				});				
			}
		});
});

module.exports = router;