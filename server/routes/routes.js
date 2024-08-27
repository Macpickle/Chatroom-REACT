const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const appError = require('../utils/appError.js');
const mongoose = require('mongoose');
const {USER_ALREADY_EXISTS,
      INVALID_LOGIN_CREDENTIALS,
      FIELD_MISSING,
      INVALID_CREDENTIALS,
      CHAT_NOT_FOUND,
      USER_NOT_FOUND,
      INTERNAL_SERVER_ERROR,
      } = require('../constants/constants');

const { tryCatch } = require('../utils/tryCatch');

//reset password
const { forgetPassword, resetPassword } = require('../controllers/auth');

//models
const User = require('../models/Users');
const Message = require('../models/messages');
const messages = require('../models/messages');

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

router.get('/api/login', tryCatch(async (req, res) => {
    if (req.user) {
        const user = await User.findOne({ username: req.user.username }, { username: 1 });
        return res.json({user});
    } else {
        return res.status(401).json({
            status: 'error',
            message: 'User not logged in',
        });
    }
}));

//login user
router.post('/api/login', passport.authenticate('local', {
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
    req.session.destroy(function (err) {
        if(err) {
            console.log("error: " + err);
            res.status(500).json({message: "Error destroying session"});
        } else{
            res.clearCookie('sid');
            res.status(200).json({message: "Logged out successfully"});
        }});
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

    res.json(messages);
}));

router.get('/api/messages/:id', tryCatch(async (req, res) => {
    const message = await Message.find({members: req.params.id});
    res.json(message);
}));

router.get('/api/messageUsers/:id', tryCatch(async (req, res) => {
    const message = await Message.find({members: req.params.id}, {members: 1});  
    var memberArray = [];

    message.forEach(element => {
        //remove if user is the same as the current user
        element.members.forEach((member, index) => {
            if (member === req.params.id) {
                element.members.splice(index, 1);
            }
        });      
    });

    //get the members photos
    for (var i = 0; i < message.length; i++) {
        for (var j = 0; j < message[i].members.length; j++) {
            const user = await User.findOne({username: message[i].members[j]}, {photo: 1, username: 1});
            memberArray.push(user);
        }
    }

    //add the photos to the message object
    message.forEach((element, index) => {
        element.members = memberArray[index];
    });

    res.json(message);
}));

//create a new message
router.post('/api/messages', tryCatch(async (req, res) => {
    const { members, message, sender, reciever } = req.body;

    if (!reciever) {
        throw new appError(FIELD_MISSING, 'Reciever is empty!', 401);
    }

    if (!message) {
        throw new appError(FIELD_MISSING, 'Message is empty!', 401);
    }

    if (sender === reciever) {
        throw new appError(INVALID_CREDENTIALS, 'Cannot send message to self', 401);
    }

    const recieverExists = await User.findOne({ username: reciever });
    
    if (!recieverExists) {
        throw new appError(INVALID_CREDENTIALS, 'User does not exist', 401);
    }

    const existingMessage = await Message.findOne({members: [sender, reciever]});
    if (existingMessage) {
        throw new appError(INVALID_CREDENTIALS, 'Message already exists', 401);
    }
    
    const messageArray = {
        message: message,
        sender: sender,
        time: formattedDate(),
        _id: new mongoose.Types.ObjectId(),
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

// add a new message to an existing message
router.post('/api/message', tryCatch(async (req, res) => {
    const { members, message, sender, reciever, reply } = req.body;
    
    if (!message) {
        throw new appError(FIELD_MISSING, 'Message is empty!', 401);
    }

    if (!members || !sender || !reciever) {
        throw new appError(INTERNAL_SERVER_ERROR, 'Error within the server!', 500);
    }

    const messageCollection = await Message.findOne({members: (sender, reciever)});

    const messageTime = formattedDate();
    const messageID = new mongoose.Types.ObjectId();

    const newMessage = {
        message: message,
        sender: sender,
        time: messageTime,
        _id: messageID,
        reply: reply,
    }
    
    messageCollection.messages.push(newMessage);
    messageCollection.recentMessage = message;
    messageCollection.recentMessageTime = messageTime;

    messageCollection.save();
    
    res.json({message: 'Message Successfully sent!', status: 'ok', messageContent: newMessage});
}));

router.post('/api/editMessage', tryCatch(async (req, res) => {
    const {messageID, message, parentID } = req.body;

    if (!message) {
        throw new appError(FIELD_MISSING, 'Message is empty!', 401);
    } 
    
    //cannot figure out for the life of me why the sub array will not update. fix later
    return res.json({message: "fix later", status: "ok"})
}));

router.get('/api/findMessage/:messageID/:parentID', tryCatch(async (req, res) => {
    const messageArray = await Message.findOne({_id: req.params.parentID}, {messages: 1});
    
    if (!messageArray) {
        throw new appError(INVALID_CREDENTIALS, "Chat was not found.", 401);
    }

    var currentMessage = '';
    messageArray.messages.forEach(message => {
        if (message._id == req.params.messageID) {
            currentMessage = message;
        }
    });
    

    if (!currentMessage) {
        throw new appError(INVALID_CREDENTIALS, "Message was not found.", 401);
    }

    return res.json(currentMessage);
}));

//get all users, usernames and photos
router.get('/api/users', tryCatch(async (req, res) => {
    const users = await User.find({}, {username: 1, photo: 1});
    res.json(users);
}));

//get current user information
router.get('/api/users/:id', tryCatch(async(req,res) => {
    const user = await User.findOne({username: req.params.id},{username: 1, photo: 1});
    res.json({user})
}));

//updates setting object of a user
function updateSetting(settingType, settingValue, username) {
    const update = { $set: {} };
    update.$set[`settings.${settingType}`] = settingValue;

    if (!settingValue || settingValue == null) {
        throw new appError(INVALID_CREDENTIALS, "Setting cannot be empty!", 400);
    }   

    User.findOneAndUpdate({username: username}, update, { new: true })
        .then(doc => {
            return;
        })
        .catch(err => {
            //unexpected error
            throw new appError(INTERNAL_SERVER_ERROR, "Error updating settings!", 500);
        });
}

//update settings
router.post('/api/settings', tryCatch(async (req, res) => {
    const {
        username,
        newPassword,
        oldPassword,
        email,
        theme,
        language,
    } = req.body.formData;

    if (!username && !newPassword && !oldPassword && !email && !theme && !language) {
        throw new appError(FIELD_MISSING, "Fields must be filled!", 401);
    }

    const currentUser = req.body.username;
    const user = await User.findOne({ username: currentUser });

    if (username) {
        //check if username is available
        const userExists = await User.findOne({username: username}, {username: 1})
        if (userExists) {
            //send error to user
            throw new appError(INVALID_CREDENTIALS, "Username is already taken!", 401);
        }

        user.username = username
    }

    if (newPassword) {
        if (!oldPassword) {
            //send error to user
            throw new appError(INVALID_CREDENTIALS, "Old password is required!", 401);
        }

        const samePassword = await bcrypt.compare(oldPassword, user.password)

        if (!samePassword) {
            //send error to user
            throw new appError(INVALID_CREDENTIALS, "Incorrect Password", 401);
        }

        user.password = await bcrypt.hash(newPassword, 10);
    }

    if (oldPassword && !newPassword) {
        //send error to user
        throw new appError(INVALID_CREDENTIALS, "New password is required!", 401);
    }

    if (email) {
        const userExists = await User.findOne({email: email}, {email: 1});

        if (userExists) {
            //send error to user
            throw new appError(INVALID_CREDENTIALS, "Email is already in use!", 401);
        }

        //check if email is following proper requirements
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new appError(INVALID_LOGIN_CREDENTIALS, 'Invalid email format', 401);
        }

        user.email = email
    }

    if (theme) {
        //this is a dropdown menu, forced to have a value associated with it, therefore, no use to check if values are inputted properly
        updateSetting("theme", theme, currentUser);
    }

    if (language) {
        //this is a dropdown menu, forced to have a value associated with it, therefore, no use to check if values are inputted properly
        updateSetting("language", language, currentUser);
    }
    
    user.save();
    res.json({message: 'Settings updated successfully', status: 'ok'});
}));

router.get("/api/theme/:id", tryCatch(async (req, res) => {
    const user = await User.findOne({username: req.params.id}, {settings: 1});
    const theme = user.settings.theme;
    res.json({theme});
}));

router.get("/api/profilepicture/:id",tryCatch(async (req, res) => {
    const userPhoto = await User.findOne({username: req.params.id}, {photo: 1});
    res.json(userPhoto);
}));

router.get("/api/blocked/:id", tryCatch(async (req, res) => {
    const user = await User.findOne({username: req.params.id}, {blocked: 1});
    res.json(user);
}));

router.post("/api/block", tryCatch(async (req, res) => {
    const {blockUser, currentUser} = req.body;

    if (!blockUser || !currentUser) {
        throw new appError(FIELD_MISSING, "Fields must be filled!", 401);
    }

    if (blockUser === currentUser) {
        throw new appError(INVALID_CREDENTIALS, "Cannot block self!", 401);
    }

    const blockedAccount = await User.findOne({username: blockUser}, {username: 1, photo: 1})
    const currentAccount = await User.findOne({username: currentUser}, {username: 1, photo: 1, blocked: 1})
    if (!blockedAccount || !currentAccount) {
        throw new appError(USER_NOT_FOUND, "User not found!", 401);
    }

    //checks if user is already blocked
    const isBlocked = currentAccount.blocked.some(user => user.username === blockUser);
    if (isBlocked) {
       currentAccount.blocked = currentAccount.blocked.filter(user => user.username !== blockUser);
    } else {
        currentAccount.blocked.push({ username: blockUser, photo: blockedAccount.photo });
    }

    currentAccount.save();
    res.json({message: "User blocked successfully", status: "ok", blocked: currentAccount.blocked});
}));

router.post('/api/delete', tryCatch(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new appError(FIELD_MISSING, "Fields must be filled!", 401);
    }

    const user = await User.findOne({username: username});
    if (!user) {
        throw new appError(USER_NOT_FOUND, "User not found!", 401);
    }

    const samePassword = await bcrypt.compare(password, user.password)
    if (!samePassword) {
        throw new appError(INVALID_CREDENTIALS, "Incorrect Password", 401);
    }

    await User.deleteOne({username: username});
    res.json({message: "User deleted successfully", status: "ok"});
}));

router.post('/api/deleteMessage', tryCatch(async (req, res) => {
    const {messageID, parentMessageID} = req.body;
    console.log(messageID, parentMessageID);

    if (!messageID || !parentMessageID) {
        throw new appError(FIELD_MISSING, "Field is missing.", 401);
    }

    const message = await Message.findOne({_id: parentMessageID})
    
    if (!message) {
        throw new appError(CHAT_NOT_FOUND, "Message not found.", 400);
    }

    message.messages = message.messages.filter(message => message._id != messageID);

    message.save();
    res.json({message: "Message deleted successfully", status: "ok"});
}));

module.exports = router;