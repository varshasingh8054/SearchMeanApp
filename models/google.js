const mongoose = require('mongoose');
const config = require('../config/database');
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const GodSchema = new Schema({
    provider:  String,
    googleId:  String,
    accessToken: String,
    name : String,
    email : String,
    userId: {type: ObjectId, ref: 'User'},
    dateAdded: {type: Date, default: Date.now}
});
const God=module.exports = mongoose.model('God',GodSchema);

