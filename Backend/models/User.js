import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Adjust the path as per your project structure

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']], // Limit role values to 'user' and 'admin'
    },
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  refreshTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true, // or false if you want to require it
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Export User model
export default User;