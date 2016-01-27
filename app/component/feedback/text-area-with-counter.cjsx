React = require 'react'
intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage
ComponentUsageExample = require '../documentation/component-usage-example'

TextAreaWithCounter = (props) =>

  if props.showCounter
    counter = <p className={if props.counterClassName then props.counterClassName else ""}>
                <b>{props.charLeft + " "}</b>
                <FormattedMessage id="char-left" defaultMessage="characters"/>
              </p>
  <span>
    {counter}
    <textarea
      maxLength={if props.showCounter then props.maxLength else false}
      className={if props.areaClassName then props.areaClassName else ""}
      rows={if props.rows then props.rows else "4"}
      onChange={if props.handleChange then props.handleChange.bind this}/>
  </span>


TextAreaWithCounter.displayName = "TextAreaWithCounter"

TextAreaWithCounter.description =
    <div>
      <p>Renders a text area. Counter is optional</p>
      <ComponentUsageExample description="">
        <TextAreaWithCounter
          showCounter={true}
          maxLength={200}
          handleChange={() -> console.log("test")}
          charLeft={200}/>
      </ComponentUsageExample>
    </div>

TextAreaWithCounter.PropTypes =
  showCounter: React.PropTypes.bool
  maxLength: React.PropTypes.number
  charLeft: React.PropTypes.number
  handleChange: React.PropTypes.func
  counterClassName: React.PropTypes.string
  areaClassName: React.PropTypes.string

module.exports = TextAreaWithCounter
