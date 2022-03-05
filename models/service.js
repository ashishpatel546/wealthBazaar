const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const print = require('../util/helpers')


const serviceSchema = Schema({
    title: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image_url: String
})

module.exports = mongoose.model('Service', serviceSchema)