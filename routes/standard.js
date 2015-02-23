
module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    // catch all for /...
    router.get(/(?:$|\/(.*))/i, (req, res) => {
        res.render("view-front", {
            archives: res.locals.archives
        });
    });

    return router;
})();
