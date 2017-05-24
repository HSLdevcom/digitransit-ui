import React, { PropTypes } from 'react';
import moment from 'moment';

class TimetableRow extends React.Component {
  render() {
    return (
      <div className="timetable-row">
        <h1 className="title bold">{this.props.title}:</h1>
        {this.props.stoptimes.map((time,index) => {
          return <span key={index}>
            <span className="bold">{moment.unix(time.serviceDay + time.scheduledDeparture).format('mm')}</span>
            <span>/{time.shortName} </span>
          </span>
        })}
      </div>
    );
  }
}

TimetableRow.propTypes = {
  title: PropTypes.string.isRequired,
  stoptimes: PropTypes.array.isRequired,
};

export default TimetableRow;
