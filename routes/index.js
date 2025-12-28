'use strict';
const express = require('express');
const router = express.Router();
const tool = require('../tools/fileTool');
const auth = require('../tools/pyneAuth');

// Process Model
let processSchema = require("../models/processes");

// middleware that is specific to this router
router.use((req, res, next) => {
    if (req.originalUrl === "/") {
        next();
    } else {
        processSchema.find({command: tool.pathBottom(req.originalUrl)})
            .then((process) => {
                if (process.length === 1) {
                    console.log(process);
                    const processFile = require(process[0].processPath);
                    router.use("/" + tool.pathBottom(req.originalUrl) + "/", processFile);
                    console.log(req.originalUrl);
                }
                console.log("Exiting Process Middleware")
                next("route");
            })
            .catch(err => console.log(err));
    }
})

router.route('/')
    // if a post request is ever made
    .post((req, res) => {
        console.log("Adding item to root");
        auth.addItems(req, res);
    });


module.exports = router;
