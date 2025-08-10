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
    addItem: function (req, pathString) {
        return new Promise((res, rej) => {
            tool.neighbourNames(pathString, 2)
                .then((names) => {
                    console.log("Neighbour Names: " + JSON.stringify(names));

                    // for loops through each item to be added
                    for (let i = 0; i < req.body.length; i++) {
                        const item = req.body[i];
                        const spaceRemovedName = item.name.replaceAll(" ", "_");
                        if (names.includes(spaceRemovedName + item.extension) === false) {
                            // checks if the item to be added is a folder
                            if (item.type === 'folder') {
                                let newFolder = new folderSchema({
                                    folderName: spaceRemovedName + item.extension,
                                    folderContent: [],
                                    metaData: item.data,
                                    path: pathString,
                                    cDir: [],
                                    cFiles: [],
                                });

                                newFolder.save()
                                    .then((folder_thing) => {
                                        console.log("Saved Folder: " + folder_thing);
                                        // if not in root, then updates the folder
                                        if (pathString !== ',') {
                                            this.updateParentFolder(folder_thing, true, req.originalUrl);
                                        }
                                    })
                                    .catch(err => rej(err));
                            }
                            else {
                                let newFile = new fileSchema({
                                    fileName: spaceRemovedName,
                                    fileExtension: item.extension,
                                    file: [],
                                    metaData: item.data,
                                    path: pathString,
                                });

                                // save the new file
                                newFile.save()
                                    .then((file_thing) => {
                                        console.log("Saved File: " + file_thing);
                                        // if not in root, then updates the folder
                                        if (pathString !== ',') {
                                            this.updateParentFolder(file_thing, false, req.originalUrl);
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