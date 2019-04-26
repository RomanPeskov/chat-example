const { Schema, model } = require('mongoose');

const chatSchema = new Schema({
  text: String
}, { timestamps: { createdAt: 'createdAt' } });

const Chat = model('chat', chatSchema);

module.exports = Chat;
