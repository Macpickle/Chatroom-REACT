const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const appError = require('../utils/appError.js');
const {USER_ALREADY_EXISTS,
      INVALID_LOGIN_CREDENTIALS,
      FIELD_MISSING,
      INVALID_CREDENTIALS,
      CHAT_NOT_FOUND,
      } = require('../constants/constants');

const { tryCatch } = require('../utils/tryCatch');

//reset password
const { forgetPassword, resetPassword } = require('../controllers/auth');

//models
const User = require('../models/Users');
const Message = require('../models/messages');

const formattedDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

//forget password
router.post('/api/forget-password', forgetPassword);

//reset password
router.post('/api/reset-password', resetPassword);

//register new user
router.post('/api/register', tryCatch(async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
        throw new appError(FIELD_MISSING, 'Please fill in all fields', 401);
    }

    if (password !== confirmPassword) {
        throw new appError(INVALID_LOGIN_CREDENTIALS, 'Passwords do not match', 401);
    }
    //check if user already exists
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
        throw new appError(USER_ALREADY_EXISTS, 'User already exists', 401);
    }

    //check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new appError(INVALID_LOGIN_CREDENTIALS, 'Invalid email format', 401);
    }

    //create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword,
    });
    await newUser.save();

    return res.status(201).json({
        status: 'ok',
        message: 'User registered successfully',
        username: newUser.username,
    });
}));

//login user
router.post('/api/login', passport.authenticate('local', {
    failureRedirect: '/api/login',
    failureFlash: true,
}), (req,res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Login successful',
        username: req.user.username,
    });
});

//logout user
router.get('/api/logout', (req, res) => {
    req.logout();
    res.clearCookie('sid');
    res.status(200).json({
        status: 'ok',
        message: 'User logged out',
    });
});

//handle messaging
router.get('/api/messages', tryCatch(async (req, res) => {
    const { username, messageID } = req.query;
    var messages = [];
    if (username) {
        messages = await Message.find({ members: username });
    } else if (messageID) {
        messages = await Message.findById(messageID);
    } 

    if (!messages) {
        throw new appError(CHAT_NOT_FOUND, 'Chat not found', 401);
    }

    res.json({messages});
}));

//create a new message
router.post('/api/messages', tryCatch(async (req, res) => {
    const { members, message, sender } = req.body;

    if (!message) {
        throw new appError(FIELD_MISSING, 'Message is empty!', 401);
    }
    
    const messageArray = {
        "message": message,
        "sender": sender,
        "time": formattedDate(),
    }

    const newMessage = new Message({
        members: members,
        messages: [messageArray],
        recentMessage: message,
        recentMessageTime: formattedDate(),
    });

    await newMessage.save();
    res.json({message: 'Message created successfully', status: 'ok'});
}));

module.exports = router;