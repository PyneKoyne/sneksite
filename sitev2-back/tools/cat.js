'use strict';
const express = require('express');
const router = express.Router();
const dbConfig = require('../database/db');
const tool = require('./fileTool');
const mongoose = require('mongoose');

// Folder Model
let folderSchema = require("../models/folder");

// File Model
let fileSchema = require("../models/file");

const connect = mongoose.createConnection(dbConfig.db);
let gfs;

connect.once('open', () => {
    // initialize stream
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
        bucketName: "uploads"
    });
});

module.exports = {
    outputFile: function (req) {
        const pathString = tool.pathStringify(req.originalUrl, 1);
        return new Promise((res, rej) => {
            // finds the folder the path directs to
            folderSchema.findOne({
                path: pathString,
                folderName: tool.pathTop(req.originalUrl)
            })
                .then((folder) => {
                    if (folder != null) {
                        console.log("Folder: " + folder);
                        tool.neighbourNames(tool.pathStringify(req.originalUrl), 2)
                            .then((file) => {
                                console.log("File: " + file);
                            })
                            .catch(err => rej(err));
                        res(JSON.stringify(folder));
                    }

                    const fName = tool.pathTop(req.originalUrl).split(".");
                    if (fName.length === 1) {
                        fName.push("")
                    } else {
                        fName[1] = "." + fName[1];
                    }
                    // if there is no such folder it checks if it's a file
                    fileSchema.findOne({
                        path: pathString,
                        fileName: fName[0],
                        fileExtension: fName[1]
                    })
                        .then((file) => {
                            if (file != null) {
                                gfs.find({_id: file.file[0]}).toArray((err, fileData) => {
                                    if (err != null) {
                                        res(err);
                                    }
                                    res(gfs.openDownloadStreamByName(fileData[0].filename));
                                })
                            }
                        })
                        .catch(err => rej(err));
                })
                .catch(err => rej(err));
        });
    }
}