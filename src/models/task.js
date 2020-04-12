var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

var Task = mongoose.model('Task', taskSchema);

module.exports.Task = Task;
