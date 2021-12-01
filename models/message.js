var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    Topic: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 100,
    },
    Message: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 100,
    },
    Timestamp: {
        type: Date,
        required: true,
    },
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    Avatar: {
        type: Number,
        required: true,
        minLength: 1,
        maxLength: 1,
    },
});

//Export model
module.exports = mongoose.model('Message', MessageSchema);
