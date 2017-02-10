export default function reittiopasParameterMiddleware(req, res, next) {
  if (req.query.from || req.query.to || req.query.from_in || req.query.to_in) {
    res.redirect(302, `http://classic.reittiopas.fi${req.url}`);
  }
  next();
}
