const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Student = require('./Student');

const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Student,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
}, {
  tableName: 'marks',
  timestamps: true,
});

Student.hasMany(Mark, { foreignKey: 'studentId' });
Mark.belongsTo(Student, { foreignKey: 'studentId' });

module.exports = Mark;