import moment from 'moment';

// converts the given parameter into a string in format HHmm
// Input: time - seconds since midnight
export function getStartTime(time) {
  const hours = (`0${Math.floor(time / 60 / 60)}`).slice(-2);
  const mins = (`0${(time / 60) % 60}`).slice(-2);
  return hours + mins;
}

// renders trip duration to string
// input: time duration - milliseconds
export function durationToString(inDuration) {
  const duration = moment.duration(inDuration);

  if (duration.asHours() >= 1) {
    return `${duration.hours() + (duration.days() * 24)} h ${duration.minutes()} min`;
  }

  return `${duration.minutes()} min`;
}
