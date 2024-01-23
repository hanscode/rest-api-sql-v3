'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Model {}
  Course.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false    
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: false

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