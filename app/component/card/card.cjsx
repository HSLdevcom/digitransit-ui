React                 = require 'react'
cx                    = require 'classnames'
Example               = require '../documentation/example-data'
ComponentUsageExample = require '../documentation/component-usage-example'

class Card extends React.Component

  @description:
    <div>
      <p>Renders a card container</p>
      <ComponentUsageExample description="">
        <Card className={"padding-small"}>
          content of a card
        </Card>
      </ComponentUsageExample>
    </div>

  @displayName: "Card"

  @propTypes:
    className: React.PropTypes.string

  render: ->

    <div className={cx "card", @props.className}>
      {@props.children}
    </div>

module.exports = Card
