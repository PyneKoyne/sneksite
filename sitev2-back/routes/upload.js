'use strict';
const express = require('express');
const router = express.Router();
const tool = require('../tools/fileTool');
const itemCreator = require('../tools/emptyCreator')

// File Model
let fileSchema = require("../models/file");


module.exports = (upload) => {
    router.route('/*')
        .get(function (req, res) {
            res.status(404).json("Does Not Exist")
        })

        /* POST new files to the database */
        .post(upload.array("files"), function (req, res) {
            let files = req.files;

            const pathString = tool.pathStringify(req.originalUrl);
            tool.neighbourNames(pathString, 2)
                .then((fileArray) => {

                    console.log("Neighbour File Names: " + JSON.stringify(fileArray));

                    // loops through each file to add
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];

                        // only runs if a file of the same name isn't already in the selected folder
                        if (!fileArray.includes(file.originalname)) {

                            // splits the file title into the name and the extension
                            const fileTitle = file.originalname.split(".");
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
                                    itemCreator.updateParentFolder(fileThing, false, req.originalUrl);
                                })
                                .catch(err => console.log(err));
                        }
                    }
                    res.json("Files Saved")
                })
                .catch(err => {
                    res.status(500).json(err);
                    console.log(err);
                });
        });

    return router;
}
