'use strict';
const express = require('express');
const router = express.Router();
const tool = require('../tools/fileTool');
const itemCreator = require('../tools/emptyCreator')
const path = require('path');
const frontEnd = require('./serve_page');

// Process Model
let processSchema = require("../models/processes");

// middleware that is specific to this router
router.use((req, res, next) => {
    if (req.originalUrl === "/") {
        next();
    } else {
        processSchema.find({command: tool.pathBottom(req.originalUrl)})
            .then((process) => {
                if (process.length !== 1) {
                    console.log("Process not found: " + JSON.stringify(process))
                    router.use("/*", frontEnd);
                } else {
                    console.log(process);
                    const processFile = require(process[0].processPath);
                    router.use("/" + tool.pathBottom(req.originalUrl) + "/", processFile);
                }
                next();
            })
            .catch(err => console.log(err));
    }
})

router.route('/')
    // if a post request is ever made
    .post((req, res) => {
        console.log("Request sent to root");
        itemCreator.addItem(req, ',').then(r => res.json(r));
    });


module.exports = router;
