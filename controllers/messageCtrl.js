const Conversations = require('../models/conversationModel');
const Messages = require('../models/messageModel');

// Pagination Helper
class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    paginating() {
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 9;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

const messageCtrl = {
    // ========== Create Message ==========
    createMessage: async (req, res) => {
        try {
            const { sender, recipient, text, media, call } = req.body;

            if (!recipient || (!text?.trim() && media.length === 0 && !call)) 
                return res.status(400).json({ msg: 'Empty message cannot be sent.' });

            // Upsert Conversation
            const newConversation = await Conversations.findOneAndUpdate(
                {
                    $or: [
                        { recipients: [sender, recipient] },
                        { recipients: [recipient, sender] }
                    ]
                },
                { recipients: [sender, recipient], text, media, call },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            // Save Message
            const newMessage = new Messages({
                conversation: newConversation._id,
                sender, recipient, text, media, call
            });
            await newMessage.save();

            res.json({ msg: 'Message sent successfully!' });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ========== Get Conversations ==========
    getConversations: async (req, res) => {
        try {
            const features = new APIfeatures(
                Conversations.find({ recipients: req.user._id }),
                req.query
            ).paginating();

            const conversations = await features.query
                .sort('-updatedAt')
                .populate('recipients', 'avatar username fullname');

            res.json({
                conversations,
                result: conversations.length
            });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ========== Get Messages ==========
    getMessages: async (req, res) => {
        try {
            const features = new APIfeatures(
                Messages.find({
                    $or: [
                        { sender: req.user._id, recipient: req.params.id },
                        { sender: req.params.id, recipient: req.user._id }
                    ]
                }),
                req.query
            ).paginating();

            const messages = await features.query.sort('-createdAt');

            res.json({
                messages,
                result: messages.length
            });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ========== Delete Single Message ==========
    deleteMessages: async (req, res) => {
        try {
            const deletedMessage = await Messages.findOneAndDelete({
                _id: req.params.id,
                sender: req.user._id
            });

            if (!deletedMessage)
                return res.status(404).json({ msg: 'Message not found or unauthorized.' });

            res.json({ msg: 'Message deleted successfully.' });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // ========== Delete Entire Conversation ==========
    deleteConversation: async (req, res) => {
        try {
            const conversation = await Conversations.findOneAndDelete({
                $or: [
                    { recipients: [req.user._id, req.params.id] },
                    { recipients: [req.params.id, req.user._id] }
                ]
            });

            if (!conversation)
                return res.status(404).json({ msg: 'Conversation not found or unauthorized.' });

            await Messages.deleteMany({ conversation: conversation._id });

            res.json({ msg: 'Conversation deleted successfully.' });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = messageCtrl;
