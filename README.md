# Sneksite

This project contains the source code of my [personal website](https://pynekoyne.com). This project is built using:

- MongoDB
- Node
    - Express
    - React
    - Mongoose
- Docker

---
## Features
- Custom Authentication
- Self-hosted File-system using MongoDB and Node.js
    - Allows for CRUD commands through authenticated HTTP requests to the site
- Modular design for new processes and files to the website
    - Dynamically routes different URL's to their JavaScript files using a lookup table that can be updated in the File-system.
    - Allows for updating of project posts, control of features, and addition of new blog posts without access to the machine the site is running on and with zero downtime of the site.
    - Allows for multiple front-ends on the website without the use of an external DNS provider.
- Custom Blog (NOT Wordpress)
- Cool Home Page
## Getting Started
Here are the steps to get a local copy of sneksite running.

### Prerequisites
Install the latest version of [MongoDB Community Server](https://www.mongodb.com/try/download/community), or use [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database). if using a local server, you only need the Mongo worker to be running. Sneksite will automatically create a database.

Install the latest version of [Node.js](https://nodejs.org/en/download) (including npm).

Install the latest version of [Docker](https://www.docker.com/get-started/). Ensure the Docker Daemon is running.

### Installation
1. Clone the Repo and navigate into it
```
git clone https://github.com/PyneKoyne/sneksite.git
cd sneksite
```

2. (OPTIONAL) Add SSL Certificate to `./SSL`

3. Create a file named `.env` within the root folder with the following information:
```.env
# .env
PORT=3000
USE_SSL=false
  
# SECRETS
API_KEY=  
DATABASE=mongodb://localhost:27017/exampledb # use mongo instead of localhost when in docker container
```

> **PORT**: Port you want the server to run on
>
> **USE_SSL**: Whether or not you want the website to run in HTTPS or not. If set to true, the program will read from `./SSL`.
>
> **API_KEY**: The SHA256 hash of your passkey for API requests
>
> **DATABASE**: Your MongoDB Database URL

#### Manual Build
1. Install the required Node packages
```
npm install
```

2. Start the server
```
npm start
```
#### Docker Build
1. Ensure you have Docker Installed
2. Run `docker-compose.yml`
```
docker compose up
```
> *Use `sudo` if your docker is running with privileges.
> Add the `--build` tag if you need to rebuild your Docker Container

---

## Usage
### Paths
Navigating the file-system is simple. This document will assume the base URL is https://pynekoyne.com.

The first sub-directory (`pynekoyne.com/*`) will route to different processes, namely the file-system.
### File-system
#### Accessing Files
The **`files`** sub-directory routes to `file_structure.js` which handles accessing the file-system, and creating empty folders and files.

You can access a file or folder by navigating to it as if `pynekoyne.com/files/` is the root directory, and sending a GET request. Here is an example: `pynekoyne.com/files/temp/example.txt`.
#### Creating Root
To create the root folder, send a POST request `pynekoyne.com/` with the following JSON element.
```JSON
[
	{
		"type": "folder",
		"name": "root",
		"extension": "",
		"data": { /* Metadata here */ }
	},
	{ /* Request Data In Last JSON Object */
		apikey: "" /* <- API-KEY here */,
		author: "Kenny Z"
	}
]
```
> *Note: The folder **must** be called `root`*
#### Creating Files/Folders
To create an empty file or folder, send a POST request to the desired folder you want to place the items in. The request body should contain an array of JSON elements like so:

```json
[
	{  /* Example Item JSON Object */
		"type": "folder",
		"name": "Images",
		"extension": "",
		"data": { /* Metadata here */ }
	},
	{
		"type": "file",
		"name": "flag",
		"extension": ".txt",
		"data": { /* Metadata here */ }
	},
	
	...
	
	{ /* Request Data In Last JSON Object */
		"apikey": "" /* <- API-KEY here */,
		"author": "Kenny Z"
	}
]
```

If you wanted Images to be placed in root, then you would send the request to `pynekoyne.com/files/`

#### Uploading Files
To upload a file to the file-system, you must use the `upload` process, which routes to `upload.js`.

Send a POST request to the desired folder you want to place the items in. The request body should contain the file data in a form. For example, if you wanted to upload a file to root/temp, you would send a request to `pynekoyne.com/upload/temp/`.

Additionally, the request body should contain the API-Key in the form data. In Postman it should look like the following:

<img width="845" height="360" alt="image" src="https://github.com/user-attachments/assets/45680d52-f8c9-43bb-aac8-9c2ac737c24f" />


> It is recommended to use Postman to easily send requests

---

## Documentation

##### Folder Schema
```JSON
{
    folderName: String,
    folderContent: String,    /* Data Specific To The Folder */
    metaData: JSON,
    path: String,             /* Comma Seperated Path in File-system */
    cDirs: [ObjectID],        /* List of Child Folder IDs */
    cFiles: [ObjectID]        /* List of Child File IDs */
}
```

##### File Schema
```JSON
{
    fileName: String,
    fileExtension: String,    /* File Type */
    file: [ObjectID],         /* List of IDs corresponding to File Data */
    metaData: JSON,
    path: String,             /* Comma Seperated Path in File-system */
}
```

#### Process Schema
```JSON
{
	processPath: String,       /* Path of the javascript file in Code */
	frontend: String,          /* What front-end to use */
	description: String,     
	man: String,               /* Manual of how to use the process */
	command: [String]          /* The command to access this process */
}
```
