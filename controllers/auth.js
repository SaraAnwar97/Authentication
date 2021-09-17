const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const failedValidation = require('../middleware/failed-validation');
//configure transporter
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key:process.env.API_KEY
  }
}));

exports.signup = async (req, res, next) => {
  failedValidation;
  const userName = req.body.userName;
  const email = req.body.email;
  const mobileNumber = req.body.mobileNumber;
  const password = req.body.password;
  try {
    const hashedPw = await bcrypt.hash(password, 12)
    const user = new User({
      userName: userName,
      email: email,
      mobileNumber: mobileNumber,
      password: hashedPw,
      restaurants: []
    });
    await user.save();
    res.status(201).json({
      message: 'User created',
      userId: user._id
    }); 
    transporter.sendMail({
      to: email,
      //verified email in sendgrid sender authentication
      from: 'DevelopedForTesting@gmail.com',
      subject: 'signup succeeded!',
      html: '<h1> you successfully signed up! </h1>'
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const userName = req.body.userName;
  const mobileNumber = req.body.mobileNumber;
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({
      $or: [
        {
          "userName": userName
        },
        {
          "email": email
        }, {
          "mobileNumber": mobileNumber
        }]
    })
    if (!user) {
      const error = new Error('A user with this Email or User name or mobile number could not be found');
      error.statusCode = 401; //Not authenticated
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({
      userName: loadedUser.userName,
      userId: loadedUser._id.toString()
    },
    'secretkey',
      { expiresIn: '1d' }
    );
    res.status(200).json({ token: token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  };
};

exports.reset = async (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    const token = buffer.toString('hex');
  }})
    try {
      const user = await User.findOne({ email: email })
      if (!user) {
        const error = new Error('No account with that email found');
        error.statusCode = 401; //404
        throw error;
      }
      //user with entered email found
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000; //1 hr in milliseconds
      userId = user._id.toString();
      await user.save();
      res.status(200).json({ token: token, userId: result._id.toString() });
      transporter.sendMail({
        to: email,
        //verified email in sendgrid sender authentication
        from: 'DevelopedForTesting@gmail.com',
        subject: 'Password Reset',
        html: `
       <p> You requested a password reset </p>
       <p>Click this <a href="http://localhost:8080/reset/${userId}/${token}">link</a> to set a new password.</p>
       `
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.params.userId;
  const token = req.params.token;
  let resetUser;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId
    })

    resetUser = user;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    await resetUser.save();
    res.status(201).json({
      message: 'updated password',
      userId: result._id
    }); //result: User mongoose object
    transporter.sendMail({
      to: resetUser.email,
      //verified email in sendgrid sender authentication
      from: 'DevelopedFortesting@gmail.com',
      subject: 'Password updated',
      html: '<h1> Your password is updated <h1>'
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
  // })
  // .catch(err =>{
  //   if (!err.statusCode) {
  //       err.statusCode = 500;
  //   }
  //   next(err);
  // });

};