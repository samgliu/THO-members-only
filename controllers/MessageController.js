const Message = require('../models/message');
const User = require('../models/user');
const { check, body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');

/* index */
exports.index_get = async (req, res, next) => {
    const messages = await Message.find({}).populate('User').sort({
        Timestamp: -1, // sort by desc
    });
    res.render('index', {
        title: 'Member only',
        user: req.user,
        messages: messages,
    });
};

/* create new message */
exports.create_message_get = function (req, res, next) {
    res.render('message-form', {
        title: 'Member Only System',
        user: req.user,
        errors: undefined,
    });
};

exports.create_message_post = [
    // Validate and sanitize the name field.
    body('topic', 'Topic required').trim().isLength({ min: 1 }).escape(),
    body('message', 'Message required').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('message-form', {
                title: 'Member Only System',
                user: req.user,
                errors: errors,
            });
        } else {
            const message = new Message({
                Topic: req.body.topic,
                Message: req.body.message,
                Timestamp: new Date(),
                User: req.user,
            }).save((err, rest) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        }
    },
];

/* message delete */
exports.delete_message_get = (req, res, next) => {
    if (req.user != undefined && req.user.isAdmin) {
        Message.deleteOne({ _id: req.params.id })
            .then(function () {
                res.redirect('/'); // Success
            })
            .catch(function (error) {
                // Failure
            });
    } else {
        res.render('error', {
            message: 'Permission denied',
            error: {
                status: 'Please confirm you have permission with Administer.',
                stack: 'Error!',
            },
        });
    }
};
