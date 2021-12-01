var express = require('express');
var router = express.Router();
const userController = require('../controllers/UserController');
const messageController = require('../controllers/MessageController');

/* GET home page. */
router.get('/', messageController.index_get);

// User routes
router.get('/sign-up', userController.signup_get);
router.post('/sign-up', userController.signup_post);
router.get('/sign-in', userController.signin_get);
router.post('/sign-in', userController.signin_post);
router.get('/log-out', userController.logout_get);
// User upgrade
router.get('/upgrade-member', userController.upgrade_member_get);
router.post('/upgrade-member', userController.upgrade_member_post);
router.get('/upgrade-admin', userController.upgrade_admin_get);
router.post('/upgrade-admin', userController.upgrade_admin_post);

// message
router.get('/create-message', messageController.create_message_get);
router.post('/create-message', messageController.create_message_post);
router.get('/:id/delete', messageController.delete_message_get);
module.exports = router;
