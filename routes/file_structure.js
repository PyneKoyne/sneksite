'use strict';
const express = require('express');
const router = express.Router();
const cat = require('../tools/fileModifier');
const auth = require('../tools/pyneAuth');
const tool = require("../tools/fileTool");
const {createItems} = require("../tools/emptyCreator");
const path = require("path");

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('~~/routes/file_structure.js loaded~~');
    next();
})

// how to access files and folders
router.route('/*')
    .get(function (req, res) {
        const spaceRemovedUrl = req.originalUrl.replaceAll(" ", "_");
        cat.outputFile(spaceRemovedUrl).then((item) => {
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
        auth.onAuth(req).then(() => {
            createItems(req, tool.pathStringify(req.originalUrl)).then(r => res.json(r));
        }).catch(r => {
            res.status(r.sts).json(r.msg);
        })
    })

    .delete((req, res) => {
        auth.onAuth(req).then(() => {
            const spaceRemovedUrl = req.originalUrl.replaceAll(" ", "_");
            cat.deleteFile(spaceRemovedUrl)
                .then(r => {res.status(r.sts).json(JSON.stringify(r.msg))})
                .catch(e => res.stats(500).json(e));
        }).catch(r => {
            res.status(r.sts).json(r.msg);
        })
    })

module.exports = router;
