const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    photo: {
        type: String,
        default: "https://www.w3schools.com/howto/img_avatar.png",
        required: [true, 'Photo is required']
    },
    settings: {
        type: Object,
        default: {
            "theme": "system",
            "language": "english"
        },
    }
});

module.exports = mongoose.model('User', userSchema);