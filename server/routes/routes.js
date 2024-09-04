const router = require('express').Router();
const appError = require('../utils/appError.js');
const mongoose = require('mongoose');
const {sendMessage} = require('../chatbot/bot.js');

// error code names
const {
    USER_ALREADY_EXISTS,
    INVALID_LOGIN_CREDENTIALS,
    FIELD_MISSING,
    INVALID_CREDENTIALS,
    CHAT_NOT_FOUND,
    USER_NOT_FOUND,
    INTERNAL_SERVER_ERROR,
    SERVER_ERROR,
    } = require('../constants/constants');

const { tryCatch } = require('../utils/tryCatch');

//reset password (not working)
const { forgetPassword, resetPassword } = require('../controllers/auth');

//models
const User = require('../models/Users');
const Message = require('../models/messages');

// formats date to keep similarity between multiple instances returns in DD/MM/YYYY
const formattedDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// routes for resetting password
router.post('/api/forget-password', forgetPassword);
router.post('/api/reset-password', resetPassword);

// gets messages of user/messageID depending on requirement
router.get('/api/messages', tryCatch(async (req, res) => {
    const { username, messageID } = req.query;
    var messages = [];
    var otherMembersPhotos = [];
    if (username) {
        messages = await Message.find({ members: username });
    } else if (messageID) {
        messages = await Message.findById(messageID);
    } 

    if (!messages) {
        throw new appError(CHAT_NOT_FOUND, 'Chat not found', 401);
    }
    
    for (let i = 0; i < messages.members.length; i++) {
        const user = await User.findOne({ username: messages.members[i] }, { photo: 1, username: 1 });
        otherMembersPhotos.push({username: user.username, photo: user.photo});
    }

    res.json({messages, otherMembersPhotos});
}));

// checks if passport session user is equal to current user in localstorage (sent through params)
router.get('/api/messages/:id', tryCatch(async (req, res) => {
    const message = await Message.find({members: req.params.id});
    if (!req.user) {
        throw new appError(INVALID_CREDENTIALS, 'User is not logged in', 401);
    }

    if (req.user.username !== req.params.id) {
        throw new appError(INVALID_CREDENTIALS, 'User does not have access to this chat', 401);
    }
    var otherMembersPhotos = [];
    for (let i = 0; i < message.length; i++) {
        for (let j = 0; j < message[i].members.length; j++) {
            const user = await User.findOne({ username: message[i].members[j] }, { photo: 1, username: 1 });
            if (user.username !== req.user.username) {
                otherMembersPhotos.push({username: user.username, photo: user.photo});
            }
        }
    }


    res.json({message, otherMembersPhotos});
}));

// checks if current user or other user has blocked the current user
router.get('/api/isBlocked/:otherUser/:currentUser', tryCatch(async (req, res) => {
    const {otherUser, currentUser} = req.params;
    
    if (!otherUser, !currentUser) {
        throw new appError(SERVER_ERROR, 'Server is not responding', 500);
    }

    const currentUserBlocked = await User.findOne({username: currentUser}, {blocked: 1});
    const otherUserBlocked = await User.findOne({username: otherUser}, {blocked: 1});
    var blocked = false;
    // loops through the current user blocked, if the other user is in it, switch to blocked
    for (let i = 0; i < currentUserBlocked.blocked.length; i++) {
        if (currentUserBlocked.blocked[i].username == otherUser) {
            blocked = true;
        }
    }

    // loops through the other user blocked, if the current user is in it, switch to blocked
    for (let i = 0; i < otherUserBlocked.blocked.length; i++) {
        if (otherUserBlocked.blocked[i].username == currentUser) {
            blocked = true;
        }
    }
    
    res.json(blocked);
}));

// gets all messages the current user has, for searching through messages in sidenav
router.get('/api/messageUsers/:id', tryCatch(async (req, res) => {
    const message = await Message.find({members: req.params.id}, {members: 1});  
    var memberArray = [];

    message.forEach(element => {
        // remove if user is the same as the current user
        element.members.forEach((member, index) => {
            if (member === req.params.id) {
                element.members.splice(index, 1);
            }
        });      
    });

    // get the members photos
    for (var i = 0; i < message.length; i++) {
        for (var j = 0; j < message[i].members.length; j++) {
            const user = await User.findOne({username: message[i].members[j]}, {photo: 1, username: 1});
            memberArray.push(user);
        }
    }

    // add the photos to the message object
    message.forEach((element, index) => {
        element.members = memberArray[index];
    });

    res.json(message);
}));

// create a new message 
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
    
    // creates the model for a new message object
    const messageArray = {
        message: message,
        sender: sender,
        time: formattedDate(),
        _id: new mongoose.Types.ObjectId(),
    }

    // creates a new message model
    const newMessage = new Message({
        members: members,
        messages: [messageArray],
        recentMessage: message,
        recentMessageTime: formattedDate(),
    });

    await newMessage.save();
    res.json({message: 'Message created successfully', status: 'ok'});
}));

// appends a new message to an existing message
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

    // creates a message object 
    const newMessage = {
        message: message,
        sender: sender,
        time: messageTime,
        _id: messageID,
        reply: reply,
    }
    
    // append to a message collection
    messageCollection.messages.push(newMessage);
    messageCollection.recentMessage = message;
    messageCollection.recentMessageTime = messageTime;

    messageCollection.save();
    
    res.json({message: 'Message Successfully sent!', status: 'ok', messageContent: newMessage});
}));

// allows for editing of messages
router.post('/api/editMessage', tryCatch(async (req, res) => {
    const {messageID, message, parentID } = req.body;

    if (!message) {
        throw new appError(FIELD_MISSING, 'Message is empty!', 401);
    } 
    
    // cannot figure out for the life of me why the sub array will not update. fix later
    return res.json({message: "fix later", status: "ok"})
}));

// finds a sub message of a chat log
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

// allows for deleting of messages
router.post('/api/deleteMessage', tryCatch(async (req, res) => {
    const {messageID, parentMessageID} = req.body;

    if (!messageID || !parentMessageID) {
        throw new appError(FIELD_MISSING, "Field is missing.", 401);
    }

    const message = await Message.findOne({_id: parentMessageID})
    
    if (!message) {
        throw new appError(CHAT_NOT_FOUND, "Message not found.", 400);
    }

    // filters a message if the current message is within it
    message.messages = message.messages.filter(message => message._id != messageID);

    message.save();
    res.json({message: "Message deleted successfully", status: "ok"});
}));

router.get('/api/getUser/:id', tryCatch(async (req, res) => {
    const otherUser = await User.findOne({username: req.params.id}, {username: 1, photo: 1});
    res.json(otherUser);
}));

// allows for the ai model to create a new message, and respond via a Google Generative AI 
router.post('/api/chatTest', tryCatch(async (req,res) => {
    const { message } = req.body.body.message;
    const { members, sender, reciever } = req.body.body;
    const response = await sendMessage(message); // a custom function, allows for responses to be generated

    const messageCollection = await Message.findOne({members: (sender, reciever)});

    const messageTime = formattedDate();
    const messageID = new mongoose.Types.ObjectId();

    // creates a message object
    const newMessage = {
        message: response,
        sender: sender,
        time: messageTime,
        _id: messageID,
    }
    
    // appends the message to the message collection
    messageCollection.messages.push(newMessage);
    messageCollection.recentMessage = response;
    messageCollection.recentMessageTime = messageTime;

    messageCollection.save();

    res.json({message: 'Message Successfully sent!', status: 'ok', messageContent: newMessage});
}));

module.exports = router;