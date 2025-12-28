const tool = require("./fileTool");
const folderSchema = require("../models/folder");
const fileSchema = require("../models/file");

module.exports = {
    updateParentFolder: function (item, isFolder, url) {
        // the parent folder is updated to add the new folder
        folderSchema.updateMany(
            {
                path: tool.pathStringify(url, 1),
                folderName: tool.pathTop(url)
            },
            {$push: isFolder ? {cDirs: item._id} : {cFiles: item._id}},
            function (err, result) {
                if (err) {
                    console.log(err);
                }
            }
        );
    },
    createItems: function (req, pathString) {
        return new Promise((res, rej) => {
            tool.neighbourNames(pathString, 2)
                .then((names) => {
                    console.log("~~Adding New Items (tools/emptyCreator.js/createItems)~~");
                    console.log("Existing Items: " + JSON.stringify(names));

                    // loops through each item to be added
                    for (let i = 0; i < req.body.length; i++) {
                        const item = req.body[i];
                        const itemName = item.name.replaceAll(" ", "_"); // Sanitized Item Name
                        if (names.includes(itemName + item.extension) === false) { // checks if the item name already exists
                            if (item.type === 'folder') {

                                // Creates and saves a new folder from the request body
                                let newFolder = new folderSchema({
                                    folderName: itemName + item.extension,
                                    folderContent: [],
                                    metaData: item.data,
                                    path: pathString,
                                    cDir: [],
                                    cFiles: [],
                                });

                                newFolder.save()
                                    .then((savedFolder) => {
                                        console.log("Saved Folder: " + savedFolder);
                                        if (pathString !== ',') {  // if not in root, then updates the folder
                                            this.updateParentFolder(savedFolder, true, req.originalUrl);
                                        }
                                    })
                                    .catch(err => rej(err));
                            }
                            else if (item.type === 'file') {
                                let newFile = new fileSchema({
                                    fileName: itemName,
                                    fileExtension: item.extension,
                                    file: [],
                                    metaData: item.data,
                                    path: pathString,
                                });

                                newFile.save()
                                    .then((savedFile) => {
                                        console.log("Saved File: " + savedFile);
                                        if (pathString !== ',') {  // If not in root, updates the parent folder to include the new file
                                            this.updateParentFolder(savedFile, false, req.originalUrl);
                                        }
                                    })
                                    .catch(err => rej(err));
                            }
                        }
                        else{
                            console.log("ERROR: Item Already Exists!")
                        }
                    }
                    res("uploading")
                })
                .catch(err => rej(err));
        });
    },
}