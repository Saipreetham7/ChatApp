const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized, User not loggedin!' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized, Invalid token!' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in the protected middleware", error.message);
    return res.status(500).json({message: "Internal Server Error"})
  }
};

module.exports = { protectRoute };
