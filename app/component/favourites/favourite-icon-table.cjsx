React                 = require 'react'
cx                    = require 'classnames'
ComponentUsageExample = require '../documentation/component-usage-example'
GenericTable          = require '../util/table/generic-table'
Icon                  = require '../icon/icon'

FavouriteIconTable = (props) ->

  columnWidth = {width: (100.0 / 6.0) + "%"}
  columns = props.favouriteIconIds.map (value, index) =>
    <div
      key={index}
      className={cx "favourite-icon-table-column", {"selected-icon": value == props.selectedIconId}}
      style=columnWidth
      onClick={props.handleClick.bind this, value}>
      <Icon img={value}/>
    </div>

  <GenericTable
    showLabels={false}
  >
    {columns}
  </GenericTable>

FavouriteIconTable.displayName = "FavouriteIconTable"

FavouriteIconTable.description =
    <div>
      <p>Renders a score table</p>
      <ComponentUsageExample description="">
        <FavouriteIconTable handleClick={() -> console.log("test")}/>
      </ComponentUsageExample>
    </div>

FavouriteIconTable.propTypes =
  handleClick: React.PropTypes.func.isRequired
  showLabels: React.PropTypes.bool

module.exports = FavouriteIconTable
