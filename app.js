var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
const User = require('./models/user');
var helmet = require('helmet');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
require('dotenv').config(); // protect keys

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(compression()); //Compress all routes

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); // Compress all routes
app.use(helmet());

var httpPort = 3000;
var httpsPort = 3001;
/* http */
app.listen(httpPort, () => {
    console.log(`App listening at http://localhost:${httpPort}`);
});
/* https */
var fs = require('fs');
var https = require('https');
https
    .createServer(
        {
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.cert'),
        },
        app
    )
    .listen(httpsPort, function () {
        console.log(
            `App listening on port ${httpsPort}! Go to http://localhost:${httpsPort}`
        );
    });

// set up mongoose connection
var mongoose = require('mongoose');
var dev_db_url = ''; // personal mongodb url
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDb connection error:'));

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// auth
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

passport.use(
    new LocalStrategy((email, password, done) => {
        User.findOne({ Email: email }, (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }
            bcrypt.compare(password, user.Password, (err, res) => {
                //console.log(res);
                //console.log(err);
                if (res) {
                    // passwords match! log user in
                    return done(null, user);
                } else {
                    // passwords do not match!
                    return done(null, false, { message: 'Incorrect password' });
                }
            });
            //return done(null, user);
        });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

module.exports = app;
