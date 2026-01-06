'use strict';
const express = require('express');
const router = express.Router();
const dbConfig = process.env.DATABASE;
const tool = require('./fileTool');
const mongoose = require('mongoose');

// Folder Model
let folderSchema = require("../models/folder");

// File Model
let fileSchema = require("../models/file");

const connect = mongoose.createConnection(dbConfig);
let gfs;

connect.once('open', () => {
    // initialize stream
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
        bucketName: "uploads"
    });
});

module.exports = {
    outputFile: function (url) {
        const pathString = tool.pathStringify(url, 1);
        const itemName = tool.pathTop(url);

        console.log("Printing File... (" + itemName.toString() + ")");
        return new Promise((res, rej) => {
            // finds the folder the path directs to
            folderSchema.findOne({
                path: pathString,
                folderName: itemName
            })
                .then((folder) => {
                    if (folder != null) {
                        console.log("Folder: " + folder);
                        tool.neighbourNames(tool.pathStringify(url), 2)
                            .then((file) => {
                                console.log("File: " + file);
                                console.log(typeof file.toString())
                                res(JSON.stringify(file));
                            })
                            .catch(err => rej(err));
                        // res(JSON.stringify(folder));
                    }
                    else {
                        const fName = itemName.split(".");
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
                                    console.log("File: " + file);
                                    gfs.find({_id: file.file[0]}).toArray((err, fileData) => {
                                        if (err != null) {
                                            res(err);
                                        }
                                        res(gfs.openDownloadStreamByName(fileData[0].filename));
                                    })
                                } else {
                                    res([404, "FILE/FOLDER DOES NOT EXIST"]);
                                }
                            })
                            .catch(err => rej(err));
                    }
                })
                .catch(err => rej(err));
        });
    },

    deleteFile: function(url) {
        const pathString = tool.pathStringify(url, 1);
        const itemName = tool.pathTop(url);

        console.log("Deleting File... (" + itemName.toString() + ")");
        return new Promise((res, rej) => {
            const fName = itemName.split(".");
            if (fName.length === 1) {
                fName.push("")
            } else {
                fName[1] = "." + fName[1];
            }

            // finds the folder the path directs to
            fileSchema.findOne({
                path: pathString,
                fileName: fName[0],
                fileExtension: fName[1]
            })
                .then((file) => {
                    if (file != null) {
                        console.log("File: " + file);
                        gfs.delete(file.file[0]).catch(e => console.log(e))
                        const output = JSON.stringify(file)
                        folderSchema.updateMany(
                            {
                                path: tool.pathStringify(url, 2),
                                folderName: tool.pathTop(url, 2)
                            },
                            {$pull: {cFiles: file._id}},
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                    rej("ERROR: " + err)
                                }
                                else {
                                    fileSchema.findByIdAndDelete(file._id).then(() => res({"sts": 200, "msg": output}));
                                }
                            }
                        )
                    }
                    else {
                            res({"sts": 404, "msg": "File does not exist"});
                    }
                })
                .catch(err => rej(err));
        });
    }
}