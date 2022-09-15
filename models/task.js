const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    title: String,
    date: Date,
    owner: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
})

const Task = mongoose.model("task", taskSchema)

module.exports = Task