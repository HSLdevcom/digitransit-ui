module.exports = {
  index: function home (req, res) {
    res.locals = {
      page: {
        title: "Reittiopas"
      } 
    }
    res.render('page')
  }
}