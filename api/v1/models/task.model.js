const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    title: String,
    content: String,
    status: {
        type: String,
        default: 'initial'
    },
    timeStart: Date,
    timeFinish: Date,
    createdBy: String,
    teamMember: Array,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true })

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
