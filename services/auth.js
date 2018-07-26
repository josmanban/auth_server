module.exports = () => {

	var Sequelize = require('sequelize');
	var jwt = require('jsonwebtoken');
	var models = require('../models');
	var shajs = require('sha.js');
	const Op = Sequelize.Op;
	var config = require('../config');

	var registerUser = (username,email,password)=>{
		return new Promise((resolve,reject) => {
			models.User.create({
				username : username,
				email : email,
				password : shajs('sha256').update(password).digest('hex'),
			}).then(()=>{
				resolve('Usuario registrado');		
			})
			.catch((err) => {
				reject(err.message?err.message:err);
			});		
		});
	};

	var loginUser = (username,password)=>{
		return new Promise((resolve,reject) => {
			models.User.findOne({
				where:{
					password:shajs('sha256').update(password).digest('hex'),
					[Op.or]:[
						{username:username},
						{email:username}
						],
				}
			})
			.then(function(user){		
				if(user){
					return getAuthTokens(user);
				}
				else{
					throw {
						status:401,
						message:'Nombre de usuario/email o password incorrecto.',
					};
				}
			})
			.then((data)=>{
				data.token_type='jwt';
				resolve(data);					
			})
			.catch(function(err){
				reject({
					status:err.status?err.status:500,					
					message: err.message?err.message:err,
				});
			});		
		});
	};

	var changePassword = (accessToken,newPassword)=>{
		return new Promise((resolve,reject)=>{
			if(!newPassword)
				reject(err.message?err.message:err);
			jwt.verify(
				accessToken,
				config.secretAuth,
				(err,decode)=>{
					if(err)
						reject(err.message?err.message:err);
					
					models.User.update({
						password:shajs('sha256').update(newPassword).digest('hex')
					},{
						where:{
							username: decode.username
						}
					})
					.then(()=>{
						resolve(true);
					}).catch((err) => {
						reject(err.message?err.message:err);
					});
				}
			);
		});
	};

	var getAccesToken = (user)=>{
		return new Promise((resolve,reject) => {
			try{
				var payload = {};
				payload.username = user.username;
				payload.email = user.email;		

				var accessToken = jwt.sign(
					payload,config.secretAuth,
					{ expiresIn: config.accessTokenExpireIn });
				resolve(accessToken);
			}catch(err){
				reject(err.message?err.message:err);
			}
		});	
	}

	var getRefreshToken = (accessToken)=>{
		return new Promise((resolve,reject) => {
			try{
				var refreshToken = jwt.sign(
				{
					accessToken:accessToken,		
				},
				config.secretAuth,
				{ 
					expiresIn: config.refreshTokenExpireIn 
				});			
				
				resolve(refreshToken);

			}catch(err){
				reject(err.message?err.message:err);
			}
		});
	};

	var getAuthTokens = (user)=>{
		return new Promise((resolve,reject) => {
			var accessToken;
			getAccesToken(user)
			.then(token => {
				accessToken=token;
				return getRefreshToken(token);
			})
			.then(refreshToken => {
				resolve({
					access_token:accessToken,
					refresh_token:refreshToken
				});
			})
			.catch(err => {
				reject(err.message?err.message:err);
			});
		});
	}

	return {
		loginUser:loginUser,
		registerUser:registerUser,
		getAccesToken:getAccesToken,
		getRefreshToken:getRefreshToken,
		getAuthTokens:getAuthTokens,
		changePassword:changePassword
	}
};