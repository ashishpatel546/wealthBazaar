const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const print = require('../util/helpers')

const userSchema = Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiry: Date,
  
})

module.exports = mongoose.model('User', userSchema)