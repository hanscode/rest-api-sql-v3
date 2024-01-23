'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Model {}
  User.init({
    title: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT    
    },
    estimatedTime: {
      type: DataTypes.STRING
    },
    materialsNeeded: {
      type: DataTypes.STRING
    }
  }, { sequelize });

  Course.associate = (models) => {
    // Tells Sequelize that a course can be associated with only 1 user
    Course.belongsTo(models.User, {
        foreignKey: {
            fieldName: 'userId',
        },
    });
};

  return Course;
};