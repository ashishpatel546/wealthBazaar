const mongoose = require('mongoose');


const ipoSchema = mongoose.Schema({
    script_name:{
        type: String,
        required: true
    },
    buying_price:{
        type: Number,
        required: true
    },
    selling_price: {
        type: Number,
        required: true
    },
    description:{
        type: String,
        required:true
    }
})

module.exports = mongoose.model('IPO', ipoSchema)