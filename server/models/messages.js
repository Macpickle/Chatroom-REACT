const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    messages: {
        type: Array,
        required: false
    },
    members: {
        type: Array,
        required: false
    },
    recentMessage: {
        type: String,
        required: false
    },
    recentMessageTime: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Message', messageSchema);