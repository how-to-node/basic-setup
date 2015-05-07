var constants = require('../constants');

module.exports = function(app, router) {
    // space for future api routes using router object

    // route frontend angular requests
    app.get('*', function(req, res) {
        // load index.html file
        res.sendFile(constants.baseURL + constants.indexFile);
    });
};
