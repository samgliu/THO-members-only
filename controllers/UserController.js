const User = require('../models/user');
const { check, body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');

/* sign up */
exports.signup_get = function (req, res, next) {
    res.render('sign-up-form', {
        title: 'Member Only System',
        user: req.user,
        errors: undefined,
    });
};

exports.signup_post = [
    // Validate and sanitize the name field.
    body('firstname', 'Firstname required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('lastname', 'Lastname required').trim().isLength({ min: 1 }).escape(),
    body('email').custom((value, { req }) => {
        // verify email existence
        return new Promise((resolve, reject) => {
            User.findOne({ Email: req.body.email }, function (err, user) {
                if (err) {
                    reject(new Error('Server Error'));
                }
                if (Boolean(user)) {
                    reject(new Error('E-mail already in use'));
                }
                resolve(true);
            });
        });
    }),
    body('password', 'Password required').isLength({ min: 6 }).escape(),
    body('confirm').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match! Try again.');
        }
        return true;
    }),
    body('avatar', 'Avatar required').escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('sign-up-form', {
                title: 'Member Only System',
                user: req.user,
                errors: errors,
            });
        } else {
            bcrypt.hash(req.body.password, 8, (err, hashedPassword) => {
                // if err, do something
                // otherwise, store hashedPassword in DB
                if (err) {
                    res.render('sign-up-form', {
                        title: 'Member Only System',
                        user: req.user,
                        errors: err,
                    });
                }
                const user = new User({
                    Firstname: req.body.firstname,
                    Lastname: req.body.lastname,
                    Password: hashedPassword,
                    Email: req.body.email,
                    Avatar: req.body.avatar,
                    isAdmin: false,
                    isMember: false,
                }).save((err, rest) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/');
                });
            });
        }
    },
];

/* sign in */
exports.signin_get = (req, res, next) => {
    res.render('sign-in-form', {
        title: 'Member Only System',
        user: req.user,
        errors: undefined,
    });
};

exports.signin_post = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sign-in',
});

exports.logout_get = (req, res) => {
    req.logout();
    res.redirect('/');
};

exports.upgrade_member_get = (req, res, next) => {
    res.render('upgrade-member', {
        title: 'Member Only System',
        user: req.user,
        errors: undefined,
    });
};

exports.upgrade_member_post = [
    body('member_password').custom((value, { req }) => {
        // verify email existence
        if (process.env.MEMBER_PASSWORD != value) {
            throw new Error('Wrong Member Password');
        } else {
            return true;
        }
    }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (req.user.isMember) {
            errors.errors.push({
                msg: 'User is already a member!',
            });
        }
        if (!errors.isEmpty()) {
            res.render('upgrade-member', {
                title: 'Member Only System',
                user: req.user,
                errors: errors,
            });
        } else {
            const filter = { _id: req.user._id };
            const update = { isMember: true };
            await User.findOneAndUpdate(filter, update, {
                returnOriginal: false,
            });
            res.redirect('/');
        }
    },
];

exports.upgrade_admin_get = (req, res, next) => {
    res.render('upgrade-admin', {
        title: 'Member Only System',
        user: req.user,
        errors: undefined,
    });
};

exports.upgrade_admin_post = [
    body('member_password').custom((value, { reqest }) => {
        // verify email existence
        if (process.env.Admin_PASSWORD !== value) {
            throw new Error('Wrong Admin Password');
        } else {
            return true;
        }
    }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (req.user.isAdmin) {
            errors.errors.push({
                msg: 'User is already a Admin!',
            });
        }
        if (!errors.isEmpty()) {
            res.render('upgrade-member', {
                title: 'Member Only System',
                user: req.user,
                errors: errors,
            });
        } else {
            const filter = { _id: req.user._id };
            const update = { isAdmin: true };
            await User.findOneAndUpdate(filter, update, {
                returnOriginal: false,
            });
            res.redirect('/');
        }
    },
];
