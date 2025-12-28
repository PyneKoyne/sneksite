const crypto = require('crypto');
const tool = require("./fileTool");
const {createItems} = require("./emptyCreator");

module.exports = {
    // Checks if the plaintext token has the same hash as the API-KEY
    checkAuth: function(token){
        if (typeof token !== "string"){
            return false;
        }
        const hash = crypto.createHash('sha256').update(token.toString()).digest("hex");
        if (process.env.API_KEY){
            return hash === process.env.API_KEY;
        }
        return true;
    },

    addItems: function(req, res) {
        const pathString = tool.pathStringify(req.originalUrl);
        if (req.body.length < 2) {
            res.status(500).json("Not Enough Arguments!");
            return;
        }
        const metadata = req.body.pop();
        const token = metadata.apikey;
        const authenticated = this.checkAuth(token);
        if (authenticated){
            createItems(req, pathString).then(r => res.json(r));
        }
        else{
            res.status(401).json("Invalid API-KEY")
        }
    }
};