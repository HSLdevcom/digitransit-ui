React                 = require 'react'
Icon                  = require '../icon/icon'
Link                  = require 'react-router/lib/Link'
cx                    = require 'classnames'
NotImplementedLink    = require '../util/not-implemented-link'
ComponentUsageExample = require '../documentation/component-usage-example'

CardHeader = (props) ->

  <div className={cx "card-header", props.className}>
    <span className="cursor-pointer favourite-icon right" onClick={props.addFavourite}>
      <Icon className={cx "favourite", selected: props.favourite} img="icon-icon_star"/>
    </span>
    {props.children}
    <span className={props.headingStyle || "h4"}>{props.name} ›</span>
    <p className="sub-header-h4">{props.description}</p>
  </div>

CardHeader.description =
  <div>
    <p>Generic card header, which displays card name, description,
    favourite star and optional childs</p>
    <ComponentUsageExample description="">
      <CardHeader addFavourite={() -> return} name={"Testipysäkki"} description={"Testipysäkki 2"}/>
    </ComponentUsageExample>
  </div>

CardHeader.propTypes =
  addFavourite: React.PropTypes.func
  className: React.PropTypes.string
  favourite: React.PropTypes.bool
  headingStyle: React.PropTypes.string
  name: React.PropTypes.string.isRequired
  description: React.PropTypes.string.isRequired

CardHeader.displayName = "CardHeader"

module.exports = CardHeader
