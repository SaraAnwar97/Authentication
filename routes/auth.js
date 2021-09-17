const express = require('express');
const { body } = require('express-validator/check');
const User = require('../models/users');
const authController = require('../controllers/auth');
const router = express.Router();

//POST /auth/signup
router.post('/signup', [
    body('userName').isString().isLength({ max: 10 }).trim().withMessage('Please enter a valid user name')
        .custom((value, { req }) => {
            return User.findOne({ userName: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('User name exists already, please choose a different one');
                    }
                });
        })
    ,
    body('email').isEmail().withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email exists already, please choose a different one');
                    }
                });
        }).normalizeEmail(),
    body('mobileNumber').isNumeric(),
    body('password','Please enter a password with only numbers , text , at least 5 characters and at most 10 characters'
    ).isLength({ min: 5, max: 10 }) .isAlphanumeric().trim(),
    body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        }).trim()
],
    authController.signup);

// POST /auth/login
router.post('/login',
    [body('userName', 'Incorrect user name')
        .isString()
        .isLength({ max: 10 })
        .trim(),
    body('mobileNumber', 'Incorrect mobile number')
        .isNumeric(),
    body('email', 'Incorrect email').isString().isLength({ max: 10 }).trim(),
    body('password', 'Incorrect password').isLength({ min: 5, max: 10 }).isAlphanumeric().trim()
    ], authController.login);

// POST /auth/reset
router.post('/reset', [
    body('email')
        .isEmail()
        .normalizeEmail()
], authController.reset); //send password reset link

// POST /auth/reset/userId/token
router.post('/reset/:userId/:token', [
    body('password', 'Incorrect password').isLength({ min: 5, max: 10 }).isAlphanumeric().trim()
], authController.postNewPassword); // reset password


module.exports = router;