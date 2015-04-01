var $ = require('jquery')
$('.tabs a[data-tab-id]').each(function() {
  var tabContent = $(this).attr("data-tab-id")
  $(this).click(function(event) {
    event.preventDefault()
    /* Deselect and select tab link */
    $(".tabs .selected").removeClass("selected")
    $(this).addClass("selected")
    /* Hide and show tab content */
    $(".tab-active").removeClass("tab-active")
    $("#" + tabContent).addClass("tab-active")
  })
})