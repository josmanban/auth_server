var Sequelize = require('sequelize');
var sequelize = new Sequelize(
	'auth_server','test','perro292',{
		host: 'localhost',
	    port: 3306,
	    dialect: 'mysql'
	});

var User = sequelize.import(__dirname+'/user.js');

module.exports = {
	sequelize: sequelize,
	User: User,
};