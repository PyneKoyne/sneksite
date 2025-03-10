'use strict';
const debug = require('debug');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const dbConfig = require('./database/db');
const methodOverride = require('method-override');
const multer = require('multer');
const crypto = require('crypto');
const {GridFsStorage} = require('multer-gridfs-storage');
const wss = require ('./packages/webrtc');
const fs = require('fs');
const https = require('https');
const http = require('http');
const cors = require('cors');


const routes = require('./routes/index');
const files = require('./routes/file_structure');
const uploads = require('./routes/upload');

// // This line is from the Node.js HTTPS documentation.
const options = {
    key: fs.readFileSync('../SSL/private-key.pem'),
    cert: fs.readFileSync('../SSL/certificate.pem')
};

const app = express();

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'snek', 'build')));// Start the server

// Connecting MongoDB Database
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.db).then(() => {
    console.log('Database successfully connected!')
},
    error => {
        console.log('Could not connect to database : ' + error)
    }
)

//create storage engine
const storage = new GridFsStorage({
    url: dbConfig.db,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            //encrypt filename before storing it
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            })
        });
    }
});

const WSSPORT = 8090;

const upload = multer({ storage });

app.use('/files', files);
app.use('/upload', uploads(upload));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

// port set by project settings otherwise it's 3000
app.set('port', process.env.PORT || 3000);

const server = https.createServer(options, app).listen(4000, function () {
    console.log('Express server listening on port ' + server.address().port);
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});

// init the websocket server on 8090
wss.init(server, WSSPORT)