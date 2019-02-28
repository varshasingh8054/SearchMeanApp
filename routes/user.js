const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/users1');
const Task = require('../models/task');
const config = require('../config/database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Membership = require('../models/fb');
const God = require('../models/google');
const cookieSession = require('cookie-session');
const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, APP_PATH + '/destination');
    console.log(APP_PATH + '/destination');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./mylocalStor');
}
var upload = multer({ storage: storage });

router.post('/uploadfile', upload.single("images"), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send(file);


})


// router.post('/uploadphoto', upload.single('picture'), (req, res) => {
//   var img = fs.readFileSync(req.file.path);
// var encode_image = img.toString('base64');
// // Define a JSONobject for the image attributes for saving to database

// var finalImg = {
//     contentType: req.file.mimetype,
//     image:  new Buffer(encode_image, 'base64')
//  };
// db.collection('quotes').insertOne(finalImg, (err, result) => {
//   console.log(result)

//   if (err) return console.log(err)

//   console.log('saved to database')
//   res.redirect('/')


// })
// })


// var passport = require('passport')
//   , FacebookStrategy = require('passport-facebook').Strategy;
//   passport.serializeUser(function (user, done) {
//     console.log("in serializeUser user");
//     done(null, user);
//   });
//   passport.deserializeUser(function (user, done) {
//     console.log("in deserializeUser user");
//     done(null, user);
//   });  
// passport.use(new FacebookStrategy({
//   clientID: "605635346573599",
//   clientSecret: "4b3255627ee9c9bebb13e7532d4543ee",
//   callbackURL: "http://localhost:8080/user/auth/facebook/callback"
// },
//   function (accessToken, refreshToken, profile, done) {
//     console.log(accessToken, refreshToken, profile);
//     Membership.findOne({
//       providerUserId: profile.id,
//     }, function (err, user) {
//       //No user was found... so create a new user with values from Facebook (all the profile. stuff)
//       if (!user) {
//         user = new User({
//           name: profile.displayName,
//           // email: profile.emails[0],
//           username: profile.username,
//           provider: 'facebook',
//           facebook: profile._json
//         });    
//         console.log(user);
//         console.log("Aihfdh");
//         user.save(function (err) {
//           if (err) console.log(err);
//           console.log("save");
//           return done(err, user);
//         });
//       } else {
//         //found user. Return
//         return done(err, user);
//       }
//     });
//   }
// ));
// router.get('/auth/facebook', passport.authenticate('facebook'));
// router.get('/auth/facebook/callback', passport.authenticate('facebook', {
//   successRedirect: 'http://localhost:4200/dashboard',
//   failureRedirect: '/login'
// }));



//===========================================================================================
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./mylocalStor');
}
router.post('/register', (req, res, next) => {
  const token = crypto.randomBytes(20).toString('hex');

  const today = new Date();
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    profilephoto: req.body.profilephoto,
    token: token,
    active: false,
    resetPasswordToken: '',
    resetPasswordExpires: '',
    created: today
  });
  const msg = `
    <p>You have a SignUp Request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Email: ${req.body.email} </li>
    </ul>
    <h3>Message</h3>
    <p>Click <a href="http://localhost:8080/user/verifyuser/${token}/${req.body.email}">here</a> to activate.</p>
  `;
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  let mailOptions = {
    from: '"MEAN PROJECT" <varshasingh8054@gmail.com>',
    to: req.body.email,
    subject: 'Confirmation Email!',
    text: 'This is confirmation Email.',
    html: msg
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  });
  console.log("mail sent");
  if (newUser.active == "true") {
    console.log("active is true");
  }
  else {
    User.addUser(newUser, (err, user) => {

      if (err) {
        res.json({ success: false, msg: ' Failed to register user' });
      }
      else {
        res.json({ success: true, msg: '  user registered' });
      }

    });
  }
});

router.get('/verifyuser/:token/:email', (req, res, next) => {
  User.findOne({
    email: req.params.email,
  }).then(user => {
    if (user.token === req.params.token) {
      console.log(user.active);
      user.active = true;
      console.log(user.active);
      user.save().then(emp => {
        res.sendFile(path.join(__dirname, '../emailVerify', 'verify.html'));
      })
    }
    else {
      res.send("error");
    }
  })
});

router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({ success: false, msg: 'User not found, Please register first' });
    }
    if (!user.active) {
      return res.json({ success: false, msg: 'User not active, Confirm your account from your mail' });
    }
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign({ data: user }, config.secret, {
          expiresIn: 604800 // 1 week
        });
        res.json({
          success: true,
          token: 'JWT ' + token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        })
      } else {
        return res.json({ success: false, msg: 'Wrong password' });
      }
    });
  });
});

// =============================================================================
router.post('/forgotpassword', (req, res) => {
  if (req.body.email === '') {
    res.json('email required');
    //res.json({success: false, msg: 'email required'});
  }
  console.log(req.body.email);
  User.findOne({
    email: req.body.email
  })
    .then(user => {
      if (user === null) {
        console.log('email not in database');
        res.json('email not in db');
        //res.json({success: false, msg: 'email required'});
      }
      else {
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token,
          user.resetPasswordExpires = Date.now() + 360000;
        user.save();
        const output = `
              <p>Click <a href="http://localhost:8080/user/reset/${token}/${req.body.email}">here</a> to reset password.</p>
          `;
        let transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        let mailOptions = {
          from: '"MEAN Demo" <varshasingh8054@gmail.com>',
          to: req.body.email,
          subject: 'Reset Email!',
          text: 'This is Reset Email.',
          html: output
        };
        transporter.sendMail(mailOptions, function (err, response) {
          if (err) {
            console.error('there was an error: ', err);

          } else {
            console.log('here is the res: ', response);
            res.status(200).json('recovery email sent');
          }
        });
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
});



router.get('/reset/:token/:email', (req, res, next) => {
  User.findOne({
    email: req.params.email,
  }).then(user => {
    if (Date.now() > user.resetPasswordExpires) {
      res.send("Reset Link Has Expired");
    }
    else {
      if (user.resetPasswordToken === req.params.token) {

        localStorage.setItem('email1', req.params.email);
        res.sendFile(path.join(__dirname, '../reset', 'reset.html'));
      }
      else {
        res.send("error");
      }
    }
  })
});


router.put('/updatepassword', (req, res, next) => {
  var email1 = localStorage.getItem('email1');;
  User.findOne({
    email: email1
  }).then(user => {
    if (user != null) {
      console.log('user exists in db');
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) throw err;
          console.log(hash)
          user.password = hash;
          user.resetPasswordToken = null;
          user.resetPasswordExpires = null;
          res.json({ success: true, msg: 'password updated' });
          user.save();
        });
      });
    }
    else {
      console.log('no user exists in db to update');
      res.status(404).json('no user exists in db to update');
    }
  });
});
//=================================================================================

router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  // res.json({user: req.user});
  res.json({ user: req.user });
});

router.post('/addtask', (req, res, next) => {
  console.log("Add Task");
  let newTask = new Task({
    taskId: req.body.taskId,
    taskName: req.body.taskName,
    taskDesc: req.body.taskDesc,
    taskHandler: req.body.taskHandler,
    taskClientName: req.body.taskClientName
  });
  console.log("new task " + newTask);
  Task.addTask(newTask, (err, Task) => {
    if (err) {
      res.json({ success: false, msg: ' Failed to Add Task' });
    }
    else {
      res.json({ success: true, msg: ' Added Task' });
    }
  });
});

router.get('/showtask', function (req, res) {
  // let query = {};
  //  console.log(req.query.search);
  //   console.log(query);
 
  // if (req.query.search) {
  //   query = {
  //     "$or": [
  //       { taskName: { '$regex': req.query.search } },
  //       { taskClientName: { '$regex': req.query.search } },
  //       { taskDesc: { '$regex': req.query.search } }
  //     ]
  //   };
  // }
  // Task.getTask(query, function (err, tasks) {
  //   if (err) throw err;
  //   res.json(tasks);
  //   console.log("show working");
  // });
  let query = {};
  let search=req.headers.authorization; 
  if (search) {
    Task.find({
          "$or": [
            { taskName: { '$regex': search, $options: 'i' } },
            { taskClientName: { '$regex': search, $options: 'i' } },
            { taskDesc: { '$regex': search ,$options: 'i'} }
          ]
        }, function (err, tasks) {
          console.log(tasks);
          return res.json(tasks);
        });
  }
  else
  {
  Task.getTask(function (err, tasks) {
    if (err) throw err;
    console.log(tasks);
    res.json(tasks);
    console.log("show working");
  });
  }
});


router.put('/:_id', function (req, res) {
  var update =
    {
      taskId: req.body.taskId,
      taskName: req.body.taskName,
      taskClientName: req.body.taskClientName,
      taskHandler: req.body.taskHandler,
      taskDesc: req.body.taskDesc
    }
  console.log(update);
  console.log("router put working");
  Task.updateTask(req.params._id, update, function (err, task) {
    if (err) throw err;
    res.json(task);
  });
});
//DELETE ROUTE
router.delete("/:id", function (req, res) {
  Task.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      console.log("error");
    } else {
      console.log("Task deleted");
      return res.json({ success: true, msg: 'refresh' });
      //  res.redirect('/showtask');
    }
  });
});

router.get('/find/:_id', function (req, res) {
  console.log("incmoing" + req.params._id);
  Task.find({ _id: req.params._id }, function (err, tasks)
  //Task.findById({_id:req.params._id},function(err,tasks)
  {
    if (err) {
      console.log(err);
    }
    else {
      console.log("In find route " + tasks);
      return res.json(tasks);
      // res.json({tasks: tasks});
    }
  });
});


var GoogleStrategy = require('passport-google-oauth2').Strategy;
// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  console.log("in serializeUser user");
  done(null, user.id);
});
// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    console.log("In deserialize user");
    done(err, user);
  });
});
passport.use(new GoogleStrategy({
  clientID: '253236158197-v3t0oaav0op4fsq2qorqhv8jmaj1ante.apps.googleusercontent.com',
  clientSecret: 'Dzz4NAKNVW5W7fWux4BPvRbQ',
  callbackURL: "http://localhost:8080/user/auth/google/callback",
  passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
    // console.log(profile);
    console.log(profile.id);
    God.findOne({
      googleId: profile.id,
    }, function (err, user) {
      //No user was found... so create a new user with values from Facebook (all the profile. stuff)
      if (!user) {
        user = new God({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.displayName,
          provider: 'google',
          google: profile._json,
        });
        console.log(user);
        // console.log("Google data");
        user.save(function (err) {
          if (err) console.log(err);
          console.log("save");
          // return 
          done(null, user);
        });
      } else {
        //found user. Return
        console.log("found user");
        console.log(user);
        //return 
        done(null, user);
      }
    });
  }
));
router.get('/auth/google', passport.authenticate('google',
  {
    scope: ['https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/plus.profile.emails.read']
  }));
router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:4200/dashboard',
    failureRedirect: 'http://localhost:4200/login'
  }));



// router.get('/showtask/:id', function (req, res) {
//   console.log("atleast");
//   var query = req.params.id;

//   // var query =new RegExp( search)
//   console.log("query===", query)
//   Task.find({
//     "$or": [
//       { taskName: { '$regex': query } },
//       { taskClientName: { '$regex': query } },
//       { taskDesc: { '$regex': query } }
//     ]
//   }, function (err, data) {
//     console.log("data " + JSON.stringify(data));

//     return res.json(data);

//     console.log("search detail");
//   });
// })


module.exports = router;

