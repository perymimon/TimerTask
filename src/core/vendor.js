module.exports = function () {
  /* Styles */
    require('./vendor.scss');

  /* JS */
  global.$ = global.jQuery = require('jquery');

  require('angular');
  global.moment = require('moment');

};