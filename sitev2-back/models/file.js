const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    fileName: { type: String, required: true },
    fileExtension: { type: String, required: true },
    file: { type: [mongoose.Types.ObjectId], required: true },
    metaData: { type: JSON, required: true },
    path: { type: String, required: true }
});

let File = mongoose.model("File", Schema);

Schema.post('save', function (next) {
    Schema.index({ path: 1 });
    next()
});

module.exports = File