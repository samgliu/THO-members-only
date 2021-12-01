var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    Firstname: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 100,
    },
    Lastname: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 100,
    },
    Email: {
        type: String,
        minlength: 3,
        maxLength: 100,
    },
    Password: {
        type: String,
        required: true,
        minLength: 6,
        maxLength: 100,
    },
    Avatar: {
        type: Number,
        required: true,
        minLength: 1,
        maxLength: 1,
    },
    isMember: {
        type: Boolean,
    },
    isAdmin: {
        type: Boolean,
    },
});

//Export model
module.exports = mongoose.model('User', UserSchema);
