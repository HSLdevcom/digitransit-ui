var FastClick = require('fastclick')
require('../../ui-component/offcanvas/offcanvas')

if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick(document.body);
    }, false);
}