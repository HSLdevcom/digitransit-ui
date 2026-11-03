import { useState, useEffect } from 'react';
import { useFragment } from 'react-relay';
import { useMatch } from 'found';
import { fragmentRefShape } from '../../../utils/client/shapes';
import { unixTime, unixToYYYYMMDD } from '../../../utils/client/timeUtils';
import { prepareServiceDay } from '../../../utils/client/dateParamUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import Timetable from './Timetable';
import { StopTimetablePageFragment } from './queries/StopTimetablePageFragment';

export default function StopTimetablePage({ stop: stopRef }) {
  const stop = useFragment(StopTimetablePageFragment, stopRef);
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
  stop: fragmentRefShape.isRequired,
};
