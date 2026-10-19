import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createRefetchContainer, graphql } from 'react-relay';
import { useMatch } from 'found';
import { relayShape } from '../../../utils/client/shapes';
import { unixTime, unixToYYYYMMDD } from '../../../utils/client/timeUtils';
import { prepareServiceDay } from '../../../utils/client/dateParamUtils';
import { useConfigContext } from '../../client/ConfigContext';
import Timetable from './Timetable';

function TerminalTimetablePage({ station, relay }) {
  const config = useConfigContext();
  const match = useMatch();
  const [state, setState] = useState(prepareServiceDay({}));

  useEffect(() => {
    const { query } = match.location;
    const dateFromQuery = query.date;
    if (dateFromQuery) {
      setState(prevState => ({ ...prevState, date: dateFromQuery }));
    }
    // Intentionally run only once on mount (mirrors the previous
    // componentDidMount behavior): only the initial query date matters.
  }, []);

  const onDateChange = value => {
    setState(prevState => ({ ...prevState, date: value }));
    relay.refetch(
      {
        date: value,
      },
      null,
    );
  };

  return (
    <Timetable
      stop={station}
      date={state.date}
      startDate={unixToYYYYMMDD(unixTime(), config)}
      onDateChange={onDateChange}
    />
  );
}

TerminalTimetablePage.propTypes = {
  station: PropTypes.shape({
    url: PropTypes.string,
  }).isRequired,
  relay: relayShape.isRequired,
};

export default createRefetchContainer(
  TerminalTimetablePage,
  {
    station: graphql`
      fragment TerminalTimetablePage_station on Stop
      @argumentDefinitions(date: { type: "String" }) {
        url
        ...TimetableFragment @arguments(date: $date)
      }
    `,
  },
  graphql`
    query TerminalTimetablePageQuery($terminalId: String!, $date: String) {
      station(id: $terminalId) {
        ...TerminalTimetablePage_station @arguments(date: $date)
      }
    }
  `,
);
