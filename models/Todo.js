const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Todo = sequelize.define('Todo', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
    ,
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

Todo.belongsTo(User); // Associate Todo with User

module.exports = Todo;
