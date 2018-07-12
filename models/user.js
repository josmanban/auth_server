module.exports = function(sequelize, DataTypes) {
  return sequelize.define("user", {
  	id: { 
  		type: DataTypes.INTEGER,
  		autoIncrement: true,
  		primaryKey: true,
      allowNull: false,
    },
    username: {
    	type : DataTypes.STRING,
    	unique : true,
      allowNull: false,
    },
    email: {
    	type : DataTypes.STRING,
    	unique : true,
      allowNull: false,
    },
    password: {
      type : DataTypes.STRING,
      allowNull: false,
    }
  })
};