var FastClick = require('fastclick')
require('../../ui-component/offcanvas/offcanvas')
require('../../ui-component/tabs/tabs')

if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick(document.body);
    }, false);
}