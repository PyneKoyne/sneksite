'use strict';
const express = require('express');
const path = require('path');
const router = express.Router();

router.route('/*')
    .get((req, res) => {
        if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
            console.log("Routed to routes/serve_page.js: Route Is File");
        } else {
            console.log("Routed to routes/serve_page.js: Route Is Page");
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        }
        console.log(path.join(__dirname, '..', 'public'));
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    })

module.exports = router;