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
      validate: {
        len: [3,75],
        isAlphanumeric: true,        
        notEmpty: true,        
      }
    },

    email: {
    	type : DataTypes.STRING,
    	unique : true,
      allowNull: false,
      validate: {        
        isEmail: true,        
        notEmpty: true,
      }
    },

    password: {
      type : DataTypes.STRING,
      allowNull: false,      
      notEmpty: true,
    },

    firstName: {
      type : DataTypes.STRING,      
      allowNull: true,
      validate: {
        len: [2,75],
        isAlpha: true,       
      }
    },

    lastName: {
      type : DataTypes.STRING,      
      allowNull: true,
      validate: {
        len: [2,75],
        isAlpha: true,        
      }
    },

    isActive:{
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },

    isStaff:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },        
  })
};