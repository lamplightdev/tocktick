var virtual = require('virtual-html');

module.exports = function (html) {
  return new Promise((resolve, reject) => {
    virtual(html, (err, dom) => {
      if (err) {
        reject(err);
      } else {
        resolve(dom);
      }
    });
  });
};
