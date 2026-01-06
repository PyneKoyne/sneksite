const crypto = require('crypto');

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

    onAuth: function(req) {
        return new Promise((success, rej) => {
            console.log(req.body)
            if (typeof req.body.length !== "number" || req.body.length < 2) {
                rej({"sts": 500, "msg":"Not Enough Arguments"});
            }
            else {
                const metadata = req.body.pop();
                const token = metadata.apikey;
                const authenticated = this.checkAuth(token);
                if (authenticated) {
                    success();
                } else {
                    rej({"sts": 401, "msg": "Invalid APIKEY"});
                }
            }
        });
    }
};