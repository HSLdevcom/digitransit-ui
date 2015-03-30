var FastClick = require('fastclick')
require('../../ui-component/offcanvas/offcanvas')
require('../../ui-component/tabs/tabs')
require('../../ui-component/sub-navigation/sub-navigation')

if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick(document.body);
    }, false);
}