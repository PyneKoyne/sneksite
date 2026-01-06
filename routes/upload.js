'use strict';
const express = require('express');
const router = express.Router();
const tool = require('../tools/fileTool');
const itemCreator = require('../tools/emptyCreator')
const auth = require('../tools/pyneAuth')

// File Model
let fileSchema = require("../models/file");
const path = require("path");

module.exports = (upload) => {
    router.route('/*')
        .get(function (req, res) {
            res.sendFile(path.join(__dirname, '..', 'public', 'snekviewer', 'index.html'));
        })

        /* POST new files to the database */
        .post(upload.array("files"), function (req, res) {
            console.log("~~routes/upload.js~~");
            let files = req.files;
            let token = req.body.apikey;

            if (!auth.checkAuth(token)){
                res.status(401).json("Invalid API-KEY");
                return;
            }

            const pathString = tool.pathStringify(req.originalUrl);
            console.log(pathString);
            let output = [[], []];
            tool.neighbourNames(pathString, 1)
                .then((names) => {
                    console.log("Existing Items: " + JSON.stringify(names));

                    // loops through each file to add
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const spacedRemovedName = file.originalname.replaceAll(" ", "_");

                        // only runs if a file of the same name isn't already in the selected folder
                        if (!names[1].includes(spacedRemovedName)) {

                            // splits the file title into the name and the extension
                            const fileTitle = spacedRemovedName.split(".");
                            const fileName = fileTitle[0];
                            let fileExtension = "";

                            if (fileTitle.length > 1) {
                                fileExtension = '.' + fileTitle[1]
                            }

                            // makes the new file
                            let newFile = new fileSchema({
                                fileName: fileName,
                                fileExtension: fileExtension,
                                file: [file.id],
                                metaData: {},
                                path: pathString,
                            });

                            // saves the file and updates its parent folder to include its id
                            newFile.save()
                                .then((fileThing) => {
                                    itemCreator.updateParentFolder(fileThing, false, req.originalUrl)
                                        .then(() => {
                                            output[0].push(spacedRemovedName);
                                            if (output[0].length + output[1].length === files.length){
                                                res.status(200).json({"Files Uploaded": output[0], "Failed Uploading": output[1]})
                                            }
                                        }).catch((e) => {
                                            console.log(e);
                                            output[1].push(spacedRemovedName);
                                        });
                                })
                                .catch((err) => {
                                    console.log(err);
                                    output[1].push(spacedRemovedName);
                                });
                        }
                        else{
                            output[1].push(spacedRemovedName)
                        }
                    }
                })
                .catch(err => {
                    res.status(500).json(err);
                    console.log(err);
                });
        })
        .put(upload.array("files"), function (req, res) {
            let files = req.files;
            let token = req.body.apikey;

            if (!auth.checkAuth(token)){
                res.status(401).json("Invalid API-KEY");
                return;
            }

            const pathString = tool.pathStringify(req.originalUrl, 1);
        });

    return router;
}
