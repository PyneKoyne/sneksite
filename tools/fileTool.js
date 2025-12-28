fileSchema = require("../models/file");
folderSchema = require("../models/folder");

/* Currently this file tool gives functions to:
 
- pathStringify: 
    turn the url string into a database PATH

- neighbours: 
    grab the all the files and folders which have a PATH string equal to the one given

- names: 
    get the names of an array of documents by concatenating them

- neighbourNames: 
    gets the names of the descendents of a folder by using its PATH and calling `neighbours` and `names`

*/

module.exports = {

    //turns a path like /upload/users/ice cream/pawn.jpg into [,root,users,ice cream,pawn.jpg]
    pathStringify: function (rawPath, back = 0) {

        // turns a path like /stupid/users/ice cream/ into ["root", "users", "ice cream"]
        let path = rawPath.substring(1).split('/');
        path[0] = 'root';

        if (path.at(-1) === '') {
            path.pop();
        }

        let pathString = ',';

        //turns the path into a string like [,root,users,ice cream,pawn.jpg]
        for (let i = 0; i < path.length - back; i++) {
            pathString += path[i] + ',';
        }

        return pathString
    },

    pathTop: function (rawPath) {
        let path = rawPath.substring(1).split('/');

        path[0] = 'root';

        if (path.at(-1) === '') {
            path.pop();
        }

        return path.at(-1);
    },

    pathBottom: function (rawPath) {
        let path = rawPath.substring(1).split('/');

        return path.at(0);
    },

    neighbours: function (path, type) {
        // returns an array of all the files in the same directory
        return new Promise((res, rej) => {
            folderSchema.find({ path: path })
                .then((folder) => {
                    fileSchema.find({ path: path })
                        .then((file) => {
                            if (folder == null) {
                                console.log("In fileTool.js: No Path Exists")
                                res([[], []]);
                            }
                            else if (type === 0) {
                                res([file]);
                            }
                            else if (type === 1) {
                                res([folder]);
                            }
                            else if (type === 2) {
                                res([folder, file]);
                            }
                        })
                        .catch(err => rej(err));
                    
                })
                .catch(err => rej(err));
        });

    },

    // returns a list containing the names of the folder/file ids it is given
    names: function (ids) {

        const folder = ids[0];
        const file = ids[1];
        console.log("File ID: " + file);
        console.log("Folder ID: " + folder);
        const nameList = []

        folder.forEach(function (item) {
            nameList.push(item.folderName)
        });

        file.forEach(function (item) {
            nameList.push(item.fileName + item.fileExtension)
        });

        console.log(nameList)

        return nameList;
    },

    // returns a promise containing the names of the folder/file neighbours (children) of the current folder path
    neighbourNames: function (path, type) {

        return new Promise((res, rej) => {
            // gets the id's of its neighbours first
            this.neighbours(path, type)
                .then((documents) => {
                    // turns the list of id's into a list of names
                    res(this.names(documents));

                })
                .catch(err => rej(err));
        });
    },

    fileTitle: function (file) {
        return file.fileName + file.fileExtension;
    }
};