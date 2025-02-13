const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');
const messageRoutes = require('./routes/message.route');
const { connectDB } = require('./lib/db');
const { app, server } = require('./lib/socket');
const path = require('path');

dotenv.config();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
// app.use(express.urlencoded)
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

if (process.env.NODE_ENV == 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/chatapp/dist')));

  app.get('*', (req, res) => {
    res.sendFile(
      path.join(__dirname, '../../frontend/chatapp', 'dist', 'index.html')
    );
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  connectDB();
});
