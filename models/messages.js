const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    grp: String,
    content: [],
});

module.exports = mongoose.model('Message', messageSchema);