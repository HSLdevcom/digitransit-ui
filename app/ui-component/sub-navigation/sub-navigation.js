var $ = require('jquery') 
$("button.sub-navigation-switch").click(function() {
  var time = $(".sub-navigation").is(":visible"); 
  if (time) {
    $(this).text('nyt')
    $("section.content").removeClass("sub-navigation-push")
  } else {
    $(this).text('aika')
    $("section.content").addClass("sub-navigation-push")
  }
  $(".sub-navigation").toggle()
})