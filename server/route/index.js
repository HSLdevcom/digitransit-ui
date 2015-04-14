module.exports = {
  index: function(req, res) {
    res.render('app', { 
      partials: { 
        svgSprite: 'svg-sprite'
      }
    })
  } 
}