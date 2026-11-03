import { DateTime } from 'luxon';
import { useFragment } from 'react-relay';
import { useMatch } from 'found';
import { DATE_FORMAT } from '../../../utils/shared/constants';
import { fragmentRefShape } from '../../../utils/client/shapes';
import { unixTime, unixToYYYYMMDD } from '../../../utils/client/timeUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import Timetable from './Timetable';
import { StopTimetablePageFragment } from './queries/StopTimetablePageFragment';

export default function StopTimetablePage({ stop: stopRef }) {
  const stop = useFragment(StopTimetablePageFragment, stopRef);
  const config = useConfigContext();
  const match = useMatch();
  const date =
    match.location.query.date || DateTime.now().toFormat(DATE_FORMAT);

  return (
    <Timetable
      stop={stop}
      date={date}
      startDate={unixToYYYYMMDD(unixTime(), config)}
    />
  );
}

StopTimetablePage.propTypes = {
  stop: fragmentRefShape.isRequired,
};
