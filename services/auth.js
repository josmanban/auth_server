var registerUser = (username,email,password)=>{
	return new Promise(resolve,rejec){
		models.User.create({
			username : username,
			email : email,
			password : shajs('sha256').update(password).digest('hex'),
		}).then(()=>{
			resolve('Usuario registrado');		
		})
		.catch((err)=>{
			reject(err.message?err.message:err);
		});		
	};
};

var loginUser = (username,password)=>{
	return new Promise(resolve,reject){
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
				return getAccesToken(user)
			}
			else{
				throw {
					status:401,
					message:'Nombre de usuario/email o password incorrecto.',
				};
			}
		})
		.then((accessToken,refreshToken)=>{
			resolve({
				token_type:'jwt',
				access_token : accessToken,
				refresh_token : refreshToken,
			});					
		});
		.catch(function(err){
			reject({
				status:err.status:err.status:500,
				message: err.message?err.message:message,
			});
		});		
	};
};

var getAccesToken = (user)=>{
	return new Promise(resolve,reject){
		try{
			var payload = {};
			payload.username = user.username;
			payload.email = user.email;		

			var accessToken = jwt.sign(
				payload,config.secretAuth,
				{ expiresIn: 60 });
			resolve(accessToken);
		}catch(err){
			reject(err.message);
		}
	};	
}

var getRefreshToken = (accessToken)=>{
	return new Promise(resolve,reject){
		try{
			var refreshToken = jwt.sign({
				accessToken:accessToken,		
			},config.secretAuth,{ expiresIn: 3600 });

			resolve(refreshToken);			
		}catch(err){
			reject(err.message);
		}
	};
}

var getAuthTokens = (user)=>{
	return new Promise(resolve,reject){
		var accessToken;
		getAccesToken(user)
		.then(token=>{
			accessToken=token;
			return getRefreshToken(token)
		})
		.then(refreshToken=>{
			resolve(accessToken,refreshToken);
		})
		.catch(err){
			reject(err.message?err.message:err);
		}
	};
}

module.exports = {
	loginUser:loginUser,
	registerUser:registerUser,
	getAccesToken:getAccesToken,
	getRefreshToken:getRefreshToken,
	getAuthTokens:getAuthTokens,
}