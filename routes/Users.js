const express = require('express');
const users = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');
const Session = require('../models/Session');
const Follower = require('../models/Follower');
const RouteBuilder = require('../routes/template_route');
const registerValidator = require('../validators/registerValidator');
const fs = require('fs')


users.use(cors());
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



users.post('/register', (req, res) => {
    let userData = {
        nickname: req.body.nickname,
        email: req.body.email,
        password: req.body.password,
        active: false,
        activationToken: ""
    };

    registerValidator(req.body.nickname, req.body.email, req.body.password).then(passed => {

        userData.activationToken = jwt.sign(userData, process.env.SECRET_KEY, {
            expiresIn: 14400
        });
        console.log(userData.email);


        return User.findOne({
            email: req.body.email
        })


    }).then(user => {
        if (!user) {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                userData.password = hash;
                User.create(userData)
                    .then(user => {
                        const msg = {
                            from: process.env.COMPANY_EMAIL,
                            to: userData.email,
                            subject: "Account activation",
                            text: `Hello ${
                                userData.nickname
                                }, please use code below to activate your account`,
                            html: `Hello<strong> ${
                                userData.nickname
                                }</strong>,<br><br>Please use code below to activate your account <br><a href="${process.env.SERVICE_LINK}/users/verify/${userData.activationToken}">${process.env.SERVICE_LINK}/verify/${userData.activationToken}</a></strong>`
                        };
                        console.log(msg);
                        sgMail.send(msg);
                        user.activationToken = userData.activationToken;
                        user.save().then(() => {

                        }).catch(err => {
                            console.log(err);
                        });
                        res.send(user.email + ' registered!')
                    })
                    .catch(err => {
                        res.json(err)
                    })
            })
        } else {
            res.json({ errors: { existence: {message: 'User already exists'},message: 'An error occured'} })
        }
    }).catch(err => {
       res.json({errors: err})
    });

})

users.post('/change-password', (req, res) => {
  User.findOne({
    _id: req.params._id,
    password: req.body.old_password
  })
  .then(user => {
    if (user) {
      bcrypt.hash(req.body.password, 10, (error, hash) => {
        User.update({_id: req.params._id},{password: hash})
      .then(us => {
        res.json({success: us.nickname + ' changed password'})
      })
      .catch(err => {
        res.send('error: '+ error)
      })
      })
    } else {
      res.json({ error: 'Wrong old password' })
    }
  })
  .catch(err => {
    res.send('error: ' + err)
  })
})

users.get('/verify/:activationToken', (req, res) => {
User.findOne({activationToken: req.params.activationToken}).then(na_user => {if(na_user){
      User.updateOne({activationToken: req.params.activationToken},{$set: { activationToken:"", active:true}})
      .then(user => {
        // res.json({success: user.nickname + ' activated'})
        fs.mkdir(process.env.STORAGE_ROOT, err=> console.log(err))
        res.redirect('http://localhost:3000/');
      })
      .catch(err => {
        res.send('error: '+ err)
      })
    } else {
      res.send('Sorry user with that link does not exist')
    }})
});






users.post('/resend-activation', (req, res) => {
  User.updateOne({
    email: req.body.email
  }, {activationToken: tkn})
});

users.post('/logout', (req, res) => {
  Session.deleteOne({_id: req.body['idSession']}, (err, result) => {
    if (err) {
      console.log(err)
    }
    res.json({errors: err, data: "you are logged out"})
  })
});

users.post('/login', (req, res) => {
  if(!req.body.email || !req.body.password){
    res.json({errors: {fieldValidation: {
      message: 'All fields must be filled'
    }, message: 'An error occured'}})
  }
  User.findOne({
    $or: [
           { email : req.body.email },
           { nickname: req.body.email }
         ]
  })
    .then(user => {
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          // Passwords match
          if (user.unlockTime && user.unlockTime.getVarDate().getMilliseconds() > Date.now() ) {
              res.json({errors: `${user.banMessage}\n time to unlock: ${user.unlockTime}`})
          }
          if (user.unlockTime && user.unlockTime.getVarDate().getMilliseconds() < Date.now()) {
              user.unlockTime = null;
              user.banMessage = null;
              user.save().exec();
          }
          if(user.active){
            let sessionData = {'user': user._id, data: {key: "email", value: user.email}};
            Session.create(sessionData)
                .then(resultSession => {
                  let token = jwt.sign({_id: user._id.toString(), nickname: user.nickname, email: user.email},
                      process.env.SECRET_KEY, {
                        expiresIn: 1440
                      });
                  let obj = {errors: null, data: {id: resultSession._id.toString(), token: token}};
                  res.json(obj)
                })
                .catch(error => console.log(error));
          } else {
            res.json({errors: {activation: {message:'User is not activated'}, message: 'An error occured'}})
          }
        } else {
          res.json({ errors: {existence: {message:'Incorrect password'}, message: 'An error occured'} })
        }
      }
    })
    .catch(err => {
      res.json(err)
    })


});



users.post('/sendReset',  (req, res) => {
  User.findOne({
    email: req.body.nickname
  })
      .then( user => {
            if (user) {
              user.tokenToReset = jwt.sign(user.email, process.env.SECRET_KEY)

              console.log(user.tokenToReset);

              const msg = {
                from: process.env.COMPANY_EMAIL,
                to: user.email,
                subject: "Reset your password",
                text: `Hello ${
                    user.nickname
                    }, please use code below to reset your password`,
                html: `Hello<strong> ${
                    user.nickname
                    }</strong>,<br><br>Please use code below to activate your account <br><a href="${process.env.SERVICE_LINK}/users/openReset?email=${user.email}&tokenToReset=${user.tokenToReset}">reset</a></strong>`
              };
              console.log(msg);
              sgMail.send(msg);
              res.send('ok');
            }
          }

      ).catch( err => res.send(err))

});

users.get('/openReset', (req, res) => {
  User.findOne({
    email: req.query['email']
  })
      .then(user =>
          {
            if (!user) {
              res.json({error: "user not found"})
            }
            var chekToken = jwt.sign(user.email, process.env.SECRET_KEY);


            if (chekToken != req.query['tokenToReset']) {
              res.json({error: "token was incorrect"})
            } else {
              res.redirect('http://localhost:3000/openReset')
              res.json({error: null, status: "ok"})
            }
          }
      )
});


users.get('/profile', (req, res) => {
  var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY);

  User.findOne({
    _id: decoded._id
  })
    .then(user => {
      if (user) {
        res.json(user)
      } else {
        res.send('User does not exist')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

module.exports = users
