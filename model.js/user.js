const mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs');
const nameSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },

    email: {
        type: String,
    },
    mobilenumber: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
        select: false
    },
    photo: {
        type:String
    },
    photo_path: {
        type: String
    }


})
nameSchema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) return next();
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err); // Exit if error is found
        user.password = hash; // Assign the hash to the user's password so it is saved in database encrypted
        next(); // Exit Bcrypt function
    });
});

nameSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
const Person = mongoose.model("Person", nameSchema)
module.exports = Person;