const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,//to keep leading 0
        required: true
    },
    password: {
        type: String,
        required: true
    },
    restaurants:[{ 
        type : Schema.Types.ObjectId,
        ref: 'restaurant' 
    
}]
    ,  
    resetToken: String,
    resetTokenExpiration: Date
});

module.exports = mongoose.model('user', userSchema);