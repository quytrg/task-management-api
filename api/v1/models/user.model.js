const mongoose = require("mongoose");
const generate = require("../../../helpers/generate.helper");

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    token: {
        type: String,
        default: generate.generateRandomString(30),
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
