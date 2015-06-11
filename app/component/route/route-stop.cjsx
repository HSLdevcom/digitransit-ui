React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'

class RouteStop extends React.Component  
  render: ->
    <div className="route-stop row">
      <div className="columns small-3 route-stop-now">
        {@props.stop.now or ""}
      </div>
      <Link to="stop" params={{stopId: @props.stop.id}}>
        <div className={"columns small-6 route-stop-name " + @props.mode}>
          {@props.stop.name}<br/>
            <span className="route-stop-address">
              {@props.stop.address}
            </span>
        </div>
        <div className="columns small-2 route-stop-code">
          {@props.stop.code}
        </div>
        <div className="columns small-1 route-stop-mins">
          {@props.stop.minutes or ""}
       </div>
      </Link>
    </div>

module.exports = RouteStop