var Sequelize = require('sequelize');
var config = require('../config');


var sequelize = new Sequelize(
	config.databases[config.currentdb].name,
	config.databases[config.currentdb].user,
	config.databases[config.currentdb].password,
	{
		host: config.databases[config.currentdb].host,
	    port: config.databases[config.currentdb].port,
	    dialect: 'mysql'
	});

var User = sequelize.import(__dirname+'/user.js');

module.exports = {
	sequelize: sequelize,
	User: User,
};