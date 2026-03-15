const mongoose = require('mongoose');

const storeItemSchema = new mongoose.Schema({
  appid: Number,
  name: String,
  last_modified: Number,
  price_change_number: Number
});

module.exports = mongoose.model('StoreItem', storeItemSchema);
