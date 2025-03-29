const router = require('express').Router();
const messageCtrl = require('../controllers/messageCtrl');
const auth = require('../middleware/auth');

// ===========================
//  Messaging System Routes
// ===========================

// @route    POST /api/message
// @desc     Create and send a new message (text, media, call)
// @access   Private (Authenticated users only)
router.post('/message', auth, messageCtrl.createMessage);

// @route    GET /api/conversations
// @desc     Get all conversations for the authenticated user
// @access   Private
router.get('/conversations', auth, messageCtrl.getConversations);

// @route    GET /api/message/:id
// @desc     Get all messages from a specific conversation (by user ID)
// @access   Private
router.get('/message/:id', auth, messageCtrl.getMessages);

// @route    DELETE /api/message/:id
// @desc     Delete a specific message (if sender is the owner)
// @access   Private
router.delete('/message/:id', auth, messageCtrl.deleteMessages);

// @route    DELETE /api/conversation/:id
// @desc     Delete entire conversation and all related messages
// @access   Private
router.delete('/conversation/:id', auth, messageCtrl.deleteConversation);

// ===========================
//  Export Router
// ===========================
module.exports = router;
