'use strict';
const express = require('express');
const router = express.Router();
const tool = require('../tools/fileTool');
const cat = require('../tools/cat');
const creator = require('../tools/emptyCreator')

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ');
    next();
})

// how to access files and folders
router.route('/*')
    .get(function (req, res) {
        cat.outputFile(req).then((item) => {
            if (typeof (item) === typeof ("")) {
                res.json(item);
            }
            else {
                item.pipe(res);
            }
        }).catch(err => res.status(500).json(err));
    })

    // if a post request is ever made
    .post((req, res) => {
        const pathString = tool.pathStringify(req.originalUrl);
        creator.addItem(req, pathString).then(r => res.json(r));
    });

module.exports = router;
