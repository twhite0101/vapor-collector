const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const cors = require('cors');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('./db/User');
require('dotenv').config();

let database;

const app = express();
const server = require('http').createServer(app);

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: [`http://localhost:${process.env.LOCAL_CLIENT_PORT}`],
    credentials: true
}));

app.use(session({
    secret: process.env.SECRET_SESSION_KEY,
    resave: true,
    saveUninitialized: true
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
    User.findOne({ id: profile.id })
      .then((user, err) => {
        if (err) {
          return done(err);
        }

        if (user) {
          console.log('User found in DB');
          return done(null, user);
        }
        else {
          const payload = {
            user: profile
          };
          let newUser = new User(profile);
          newUser.save()
          console.log('New User recorded to DB');
          return done(null, newUser);
        }
      })
    }
));

app.use(passport.initialize());
app.use(passport.session());

// AUTH
app.get('/auth/steam',
    passport.authenticate('steam', { failureRedirect: 'http://localhost:4200/' }));

app.get('/auth/steam/return',
  async (req, res, next) => {
    passport.authenticate('steam', { failureRedirect: 'http://localhost:4200/' }, function async (err, user, info) {
      const payload = {
        user: user
      };
      const secretKey = process.env.ACCESS_TOKEN_KEY;
      const options = { expiresIn: 2 * 60 * 60 * 1000 };
      const accessToken = jwt.sign(payload, secretKey, options);
      res.cookie('access', accessToken, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
      res.redirect('http://localhost:4200/?lg=true');
    })(req, res, next)
  });

app.get('/auth/token-valid', ensureAuthenticated, (req, res) => {
    if (req.cookies.access){
      res.json(true)
    }
    else {
      res.json(false)
    }
  });

app.get('/logout', function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.clearCookie('access')
    res.clearCookie('refresh')
    res.redirect('http://localhost:4200/?lg=false');
  });
});

// GET
app.get('/auth/user', ensureAuthenticated, (req, res) => {
    const token = req.cookies.access;
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        res.json({ user: decoded.user });
        return;
    } catch (err) {
        // Token is invalid or expired
        res.statusCode(401).json('Unauthorized user');
        return;
    }
  });

app.get('/user/getGameLibrary', ensureAuthenticated, (req, res) => {
  const token = req.cookies.access;
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)
  if (!decoded) {
    res.statusCode(401).json('Unauthorized user');
  }
  const user = decoded.user
  axios
    .get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${user.id}&format=json&include_played_free_games=1&include_appinfo=1&include_extended_appinfo=1`)
    .then(response => {
      res.send(response.data.response)
    })
    .catch(err => {
      console.error(err)
    })
})

// MIDDLEWARE
function ensureAuthenticated(req, res, next) {
    if (req.cookies && req.cookies.access) { return next(); }
    res.redirect('/');
};
