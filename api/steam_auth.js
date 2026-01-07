const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('./db/User');
require('dotenv').config();

let database;

const app = express();
const server = require('http').createServer(app);

app.use(bodyParser.json());

app.use(cors({
    origin: ['http://localhost:4200'],
    credentials: true
}));

app.use(session({
    secret: process.env.SECRET_SESSION_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 600000,
        secure: process.env.NODE_ENV === 'production'
    }
}));

async function main() {
    await mongoose.connect(process.env.LOCAL_DATABASE_URL);
    console.log("Database connection done.");
}

main().then(() => {
  database = mongoose.connection.db;

  server.listen(3000, () => {
      console.log('Backend listening on port 3000');
  });
}).catch((error) => {
  console.log(error);
  process.exit(1);
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj)
});

passport.use(new SteamStrategy({
        returnURL: 'http://localhost:3000/auth/steam/return',
        realm: 'http://localhost:3000',
        apiKey: process.env.STEAM_API_KEY
    },
function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
    }
));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
    res.render('http://localhost:4200/', { user: res.user });
});

app.get('/auth/steam',
    passport.authenticate('steam', { failureRedirect: 'http://localhost:4200/' }));

app.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: 'http://localhost:4200/' }),
    async (req, res) => {
        const user = new User(req.user);
        await user.save().then(() => console.log('User saved'));
        res.redirect('http://localhost:4200/auth-callback');
    }
);

app.get('/api/user-status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ loggedIn: true, user: req.user })
    }
    else {
        res.json({ loggedIn: false })
    }
});

app.get('/logout', function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('http://localhost:4200/auth-callback');
  });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
};

// Errors handler.
function manageError(res, reason, message, code) {
    console.log("Error: " + reason);
    res.status(code || 500).json({ "error": message });
}
