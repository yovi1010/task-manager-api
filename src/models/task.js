const mongoose = require('mongoose')


const taskSchema = new mongoose.Schema({
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
        ref: 'User' //this piece of code make a link between the two models Task and User. Each task holds the USER_ID
    }
}, {
    timestamps: true
})


const Task = mongoose.model("Task", taskSchema)


module.exports = Task