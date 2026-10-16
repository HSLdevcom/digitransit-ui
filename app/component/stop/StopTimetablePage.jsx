import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createRefetchContainer, graphql } from 'react-relay';
import { useMatch } from 'found';
import { relayShape } from '../../../utils/client/shapes';
import { unixTime, unixToYYYYMMDD } from '../../../utils/client/timeUtils';
import { prepareServiceDay } from '../../../utils/client/dateParamUtils';
import { useConfigContext } from '../../client/ConfigContext';
import Timetable from './Timetable';

function StopTimetablePage({ stop, relay }) {
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
      stop={stop}
      date={state.date}
      startDate={unixToYYYYMMDD(unixTime(), config)}
      onDateChange={onDateChange}
    />
  );
}

StopTimetablePage.propTypes = {
  stop: PropTypes.shape({
    url: PropTypes.string,
  }).isRequired,
  relay: relayShape.isRequired,
};

export default createRefetchContainer(
  StopTimetablePage,
  {
    stop: graphql`
      fragment StopTimetablePage_stop on Stop
      @argumentDefinitions(date: { type: "String" }) {
        url
        ...TimetableFragment @arguments(date: $date)
      }
    `,
  },
  graphql`
    query StopTimetablePageQuery($stopId: String!, $date: String) {
      stop(id: $stopId) {
        ...StopTimetablePage_stop @arguments(date: $date)
      }
    }
  `,
);
