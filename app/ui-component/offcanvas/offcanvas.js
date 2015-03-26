var Slideout = require('slideout')
var $ = require('jquery') 
var slideout = new Slideout({
  'panel': document.getElementById('main'),
  'menu': document.getElementById('offcanvas-left'),
  'padding': 256,
  'tolerance': 70
})

$('#reveal-left-offcanvas').click(function() {
  slideout.toggle()
})