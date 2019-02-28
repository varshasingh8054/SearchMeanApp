const mongoose = require('mongoose');
const config = require('../config/database');
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const membershipSchema = new Schema({
    provider:  String,
    providerUserId:  String,
    accessToken: String,
    name : String,
    userId: {type: ObjectId, ref: 'User'},
    dateAdded: {type: Date, default: Date.now}
});
const Membership=module.exports = mongoose.model('Membership', membershipSchema);

