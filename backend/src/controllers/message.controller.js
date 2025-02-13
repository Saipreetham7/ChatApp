const { cloudinary } = require('../lib/cloudinary');
const { getReceiverSocketId, io } = require('../lib/socket');
const { Message } = require('../models/message.model');
const { User } = require('../models/user.model');

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedinUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedinUserId },
    }).select('-password');

    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.log('Error at the getUsersForSidebar controller : ', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    if (!messages) {
      return res.status(400).json({ message: 'Cannot render the messages' });
    }
    return res.status(200).json(messages);
  } catch (error) {
    console.log('Error at the getMessages controller: ', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo: realtime functionality goes to here using socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('Error at the sendMessage controller: ', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getUsersForSidebar, getMessages, sendMessage };
