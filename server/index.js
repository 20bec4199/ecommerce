const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const device = require('express-device');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(device.capture());
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true
// }));

// Passport config
app.use(cors());

require('./config/passport')(passport);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-oauth')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api', require('./routes/index'));
// app.use('/api/product', require('./routes/productRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'MERN OAuth API' });
});

app.use(device.capture({
  parseUserAgent: true,
  emptyUserAgentDeviceType: 'desktop',
  unknownUserAgentDeviceType: 'desktop'
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));