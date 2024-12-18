const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Assicurati che sia unico
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = User;
