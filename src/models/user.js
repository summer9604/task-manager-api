var mongoose = require('mongoose');
var { isEmail } = require('validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var { Task } = require('./task.js');

var userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Email already in use'],
        minlength: [6, 'Password too short'],
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) throw new Error('Wtf dude, u lil smartass.');
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!isEmail(value)) throw new Error('Not valid email');
        }
    },
    age: {
        type: Number,
        default: 0
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.statics.findByCredentials = async (email, password) => {

    var user = await User.findOne({ email: email });

    if (user) {
        var isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    }

    return null;
};

userSchema.methods.generateAuthToken = async function () {

    var token = await jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
    this.tokens = this.tokens.concat({ token });
    await this.save();

    return token;
};

userSchema.methods.toJSON = function () {

    var publicUser = this.toObject();

    delete publicUser.password;
    delete publicUser.tokens;
    delete publicUser.avatar;

    return publicUser;
}

userSchema.pre('save', async function (next) {

    if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 8);
    next();
})

userSchema.pre('remove', async function (next) {

    await Task.deleteMany({ owner: this._id });
    next();
});

var User = mongoose.model('User', userSchema);

module.exports.User = User;