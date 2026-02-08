const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  provider: String,
  _json: {
    steamid: String,
    communityvisibilitystate: Number,
    profilestate: Number,
    personaname: String,
    commentpermission: Number,
    profileurl: String,
    avatar: String,
    avatarmedium: String,
    avatarfull: String,
    avatarhash: String,
    lastlogoff: Number,
    personastate: Number,
    primaryclanid: String,
    timecreated: Number,
    personastateflags: Number,
    loccountrycode: String
  },
  id: String,
  displayName: String,
  photos: [{ value: String }],
  identifier: String
});

module.exports = mongoose.model('User', userSchema);
