module.exports = {
	secretAuth:'eaea123',

    accessTokenExpireIn:60,
    refreshTokenExpireIn:3600,

	currentdb:'auth_server',

	databases:{
		auth_server:{
			engine:'mysql',
			name:"auth_server",			
			user:'root',
			password:'perro292',
			host:'localhost',
			port:3306,
		}
	}
}