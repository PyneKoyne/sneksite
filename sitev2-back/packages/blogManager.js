'use strict';
const express = require('express');
const router = express.Router();
const fileSchema = require("../models/file");
const tool = require("../tools/fileTool");

// middleware that is specific to this file
router.route('/grabAll')
    .get((req, res) => {
        console.log("BLOG MANAGER BOOTED")
        fileSchema.find({ path: ",root,blog,files," })
            .select("fileName metaData path")
            .then((files) => {
                res.json(JSON.stringify(files));
            })
    })

router.route("/grab/*")
    .get((req, res) => {
        const fName = tool.pathTop(req.originalUrl);

        fileSchema.find({ path: ",root,blog,files,", fileName: fName})
            .select("file")
            .then((file) => {
                res.json(JSON.stringify(file));
            })
    })

module.exports = router;