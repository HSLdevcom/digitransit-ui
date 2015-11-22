React                 = require 'react'
cx                    = require 'classnames'
Example               = require '../documentation/example-data'
ComponentUsageExample = require '../documentation/component-usage-example'

class Card extends React.Component

  @description:
    <div>
      <p>Renders a container for one card</p>
      <ComponentUsageExample description="">
        <Card className={"padding-small"}>
          <p>Im content of a card</p>
        </Card>
      </ComponentUsageExample>
    </div>

  @displayName: "Card"

  @propTypes:
    className: React.PropTypes.string

  render: ->

    <div className={cx "card", "cursor-pointer", @props.className}>
      {@props.children}
    </div>

module.exports = Card
