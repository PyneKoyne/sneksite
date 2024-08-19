const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    processPath: { type: String, required: true },
    frontend: { type: String, required: true },
    description: { type: String, required: true },
    man: { type: String, required: true },
    command: { type: [String], required: true }
});

let Process = mongoose.model("Process", Schema);

Schema.post('save', function (next) {
    Schema.index({ path: 1 });
    next();
});

module.exports = Process