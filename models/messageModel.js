const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'conversation', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    text: { 
        type: String, 
        trim: true, // Removes whitespace before/after
        default: '' 
    },
    media: { 
        type: Array, 
        default: [] 
    },
    call: { 
        type: Object, 
        default: null 
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('message', messageSchema);
