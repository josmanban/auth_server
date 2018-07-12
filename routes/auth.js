var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Sequelize = require('sequelize');

var jwt = require('jsonwebtoken');


router.use(bodyParser.json());


router.post('/login',function(req,res,next){	
	var username = req.body.username;
	var password = req.body.password;

	var sequelize = new Sequelize(
		'hoyAprueboDb',null,null,
		{
			dialect: "sqlite",
    		storage: '/home/jose/www/hoy-apruebo-hg/hoy_apruebo/hoy_apruebo.db',
		});

	/*sequelize.authenticate()
	.then(function(){
		res.send('Conectado¡¡');
	})
	.catch(function(err){
		res.status(500).send(err);		
	});*/

	sequelize.query(
		'SELECT * FROM auth_user WHERE username LIKE :username',
		{ 
			type: sequelize.QueryTypes.SELECT,
			replacements:{
				username:username,
			}
		})
	.then(function(users){		
		if(users.length>0){
			var user=users[0];
			
			var payload = {};

			payload.username = user.username;
			payload.email = user.email;			

			var accessToken = jwt.sign(
				payload,'secretKey',
				{ expiresIn: 60 });

			var refreshToken = jwt.sign({
				accessToken:accessToken,		
			},'secretKey',{ expiresIn: 3600 });

			res.json({
				token_type:'jwt',
				access_token : accessToken,
				refresh_token : refreshToken,
			});

		}
		else{
			res.status(401).send('Nombre de usuario/password incorrecto.');
		}
	})
	.catch(function(err){
		res.status(500).send('Error en el servidor');		
	});
});

router.get('/validate',function(req,res,next){
	jwt.verify(req.get('Authorization'),'secretKey',
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
		'secretKey',function(err,decode){
			if(err){
				res.status(400).send(err.message);
			}			
			else if(decode.access_token==accessToken){
				res.status(400).send('Invalid accessToken');
			}
			else{				
				jwt.verify(accessToken,'secretKey',
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
						payload,'secretKey',
						{ expiresIn: 60 });

						var newRefreshToken = jwt.sign({
							accessToken:accessToken,		
						},'secretKey',{ expiresIn: 3600 });

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