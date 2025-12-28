'use strict';
const express = require('express');
const router = express.Router();
const cat = require('../tools/cat');
const auth = require('../tools/pyneAuth');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('~~/routes/file_structure.js loaded~~');
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
        auth.addItems(req, res)
    });

module.exports = router;
