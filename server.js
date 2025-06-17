const express = require('express');
const sequelize = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api/students', studentRoutes);

// Sync database and start server
const PORT = process.env.PORT || 5656;
sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('Unable to connect to the database:', err));