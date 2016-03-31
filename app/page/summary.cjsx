Raven              = if window? then require 'raven-js' else null
React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
Helmet             = require 'react-helmet'
SummaryPlanContainer = require '../component/summary/summary-plan-container'
SummaryNavigation    = require '../component/navigation/summary-navigation'
NoRoutePopup         = require '../component/summary/no-route-popup'
{otpToLocation, locationToCoords} = require '../util/otp-strings'
intl               = require 'react-intl'

FormattedMessage = intl.FormattedMessage

class SummaryPage extends React.Component
  @contextTypes:
    intl: intl.intlShape.isRequired

  render: ->
    from = locationToCoords(otpToLocation(@props.params.from))
    to = locationToCoords(otpToLocation(@props.params.to))

    plan = <Relay.RootContainer
      Component={SummaryPlanContainer}
      route={new queries.SummaryPlanContainerRoute(
        from:
          lat: from[0]
          lon: from[1]
        to:
          lat: to[0]
          lon: to[1]
      )}
      renderFailure={(error) =>
        Raven.captureMessage("OTP returned an error when requesting a plan", {extra: error})
        <div>
          <FormattedMessage
            id='route-not-possible'
            defaultMessage="Unfortunately your route is not possible. Technical error: '{error}'"
            values={error: error.msg}/>
           <NoRoutePopup />
        </div>
      }
      renderLoading={=> <div className="spinner-loader"/>}
    />

    meta =
      title: @context.intl.formatMessage {id: 'itinerary-summary-page.title', defaultMessage: "Route suggestion"}
      meta: [
        {name: 'description', content: @context.intl.formatMessage {id: 'itinerary-summary-page.description', defaultMessage: "Route suggestion"}}
      ]

    <SummaryNavigation className="fullscreen">
      <Helmet {...meta} />
      {plan}
    </SummaryNavigation>

module.exports = SummaryPage
