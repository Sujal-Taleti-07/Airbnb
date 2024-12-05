const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
})

//We will create for email only bcz passport-local-mongoose will automatically defined/create username and password into hash and salt

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);