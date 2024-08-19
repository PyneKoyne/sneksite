# RoboHub

JSON FORMAT FOR EVERYTHING EXCEPT UPLOADS
============================================
```
[
    {
        "type": "folder",
        "name": "Images",
        "extension": "",
        "data": {}
    }
]
```

- To create add a new root directory, send a POST request to the home page, http://localhost:1337/

- To create a new directory or file, send a POST request to that url in the file system replacing root with files, http://localhost:1337/files/

- To grab the data of a file, send a GET request[^1] to that url in the file system replacing root with files, http://localhost:1337/files/sheesh.txt

- To grab the data of a folder, send a GET request[^2] to that url in the file system replacing root with files, http://localhost:1337/files/damn

- To upload a new file, send a POST request to that url in the file system replacing root with upload, url/upload/folder/nextfolder/

[^1]: Files currently send a download stream of the chunks, will edit later to give json
#### File Schema
```
{
    fileName: String,
    fileExtension: String
    file: [ObjectID],
    metaData: JSON,
    path: String,
}
```

[^2]: Folders currently only send a json file
#### Folder Schema
```
{
    folderName: String,
    folderContent: String,
    metaData: JSON,
    path: String,
    cDirs: [ObjectID],
    cFiles: [ObjectID]
}
```

---

// TODO
// Add editing of files *PUT*
// Grabbing old version of files
// Deleting files
// Uploading entire folders
// Add grabbing part of the tree
// Create packages for commands and that stuff
