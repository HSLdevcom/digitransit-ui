React                 = require 'react'

class PiwikProvider extends React.Component
  @childContextTypes:
    piwik: React.PropTypes.object.isRequired

  getChildContext: () ->
    piwik: @props.piwik

  componentDidMount: () ->
    # PiwikProvider is the highest level component we have made and thus fires
    # componentDidMount the last, after all the children are done,
    # so we use it as a point to check that React is done loading.
    piwik = @props.piwik
    timing = performance.timing

    # See https://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface
    # for explanation of these
    piwik.trackEvent('monitoring', 'perf', 'fetch', timing.domLoading - timing.fetchStart)
    piwik.trackEvent('monitoring', 'perf', 'parse', timing.domComplete - timing.domLoading)
    # Running scripts between timing.domComplete and timing.loadEventStart, and
    # onLoad handlers between timing.loadEventStart and timing.loadEventEnd take 0ms,
    # because the scripts are async.
    # If this changes, more data points should be added.
    piwik.trackEvent('monitoring', 'perf', 'react', Date.now() - timing.loadEventEnd)

    # TODO Add more data points for loading parts of the frontpage,
    #      and for tracking other pages than just the front (since PiwikProvider
    #      will never mount twice without manual refresh).
    #      In some cases microsecond accuracy from Usr Timing API could be necessary.
    #      Something like https://www.npmjs.com/package/browsertime might be useful
    #      then..
    #      In case we think there's a bottleneck in particular resources,
    #      we need the Resource Timing API (http://caniuse.com/#feat=resource-timing)
    #      to get more detailed data.

  render: ->
    React.Children.only(@props.children)

module.exports = PiwikProvider
