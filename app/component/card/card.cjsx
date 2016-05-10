React                 = require 'react'
cx                    = require 'classnames'
Example               = require '../documentation/example-data'
ComponentUsageExample = require '../documentation/component-usage-example'

Card = ({className, children}) ->
  <div className={cx "card", className}>
    {children}
  </div>

Card.description =
  <div>
    <p>Renders a card container</p>
    <ComponentUsageExample description="">
      <Card className={"padding-small"}>
        content of a card
      </Card>
    </ComponentUsageExample>
  </div>

Card.displayName = "Card"

Card.propTypes =
  className: React.PropTypes.string

module.exports = Card
