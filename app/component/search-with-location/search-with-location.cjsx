React          = require 'react'
Icon           = require '../icon/icon.cjsx'
Search         = require './search.cjsx'
Location       = require './location.cjsx'

class SearchWithLocation extends React.Component

  render: ->
    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row">
            <div className="small-12 columns">
              <Location/>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <Search/>
            </div>
            <div className="small-1 columns">
              <span className="postfix search">
                <Icon img={'icon-icon_search'}/>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

module.exports = SearchWithLocation