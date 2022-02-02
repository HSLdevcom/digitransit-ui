/**
 * TEST CASES:
 *
 * 0 = before fix:
 *     normal week (mon - fri): wk1 - missing mon & tue, wk2 - with holiday on thu, wk3 to wk5 - normal week
 *     returns by following (range: day tabs -> other dates dropdown directs to day):
 *     wk1mon - wk2sun: mon-wed and fri (replacing wk1 with wk2) -> wk1mon
 *     wk3mon - wk5sun: mon-fri -> wk3mon
 *
 * 1 = normal week (mon - fri): wk1 - missing mon & tue, wk2 to wk5 - normal week
 *     returns by following (range: day tabs) without other dates dropdown:
 *     wk1mon - wk5sun: mon-fri
 *
 * 2 = normal week (mon - fri): wk1 - missing mon & tue, wk2 - with holiday on thu, wk3 to wk5 - normal week
 *     returns by following (range: day tabs -> other dates dropdown directs to day):
 *     wk1mon - wk1sun: mon-fri (replacing wk1 with normal week => w1 = w3) -> wk1mon
 *     wk2mon - wk2sun: mon-wed and fri -> wk2mon
 *     wk3mon - wk5sun: mon-fri -> wk3mon
 *
 * 3 = normal week (mon - fri and sat): wk1 - missing mon & tue, wk2 - with holiday on thu, wk3 to wk5 - normal week
 *     returns by following (range: day tabs -> other dates dropdown directs to day):
 *     wk1mon - wk1sun: mon-fri and sat (replacing wk1 with normal week => w1 = w3) -> wk1mon
 *     wk2mon - wk2sun: mon-wed and fri and sat -> wk2mon
 *     wk3mon - wk5sun: mon-fri and sat, wk3mon -> wk3mon
 *
 * 4 = short week (wed - fri and sat): wk1 - missing mon & tue, wk2 - with holiday on thu, wk3 to wk5 - normal week
 *     returns by following (range: day tabs -> other dates dropdown directs to day):
 *     wk1mon - wk1sun: mon-fri and sat (replacing wk1 with normal week => w1 = w3) -> wk1wed
 *     wk2mon - wk2sun: mon-wed and fri and sat -> wk2wed
 *     wk3mon - wk5sun: mon-fri and sat -> wk3wed
 */

const data1 = {
  info: 'test #1',
  wk1mon: [],
  wk1tue: [],
  wk1wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1sat: [],
  wk1sun: [],
  wk2mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2sat: [],
  wk2sun: [],
  wk3mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3sat: [],
  wk3sun: [],
  wk4mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4sat: [],
  wk4sun: [],
  wk5mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5sat: [],
  wk5sun: [],
};

const data2 = {
  info: 'test #0 or #2',
  wk1mon: [],
  wk1tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1sat: [],
  wk1sun: [],
  wk2mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2thu: [],
  wk2fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2sat: [],
  wk2sun: [],
  wk3mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3sat: [],
  wk3sun: [],
  wk4mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4sat: [],
  wk4sun: [],
  wk5mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5sat: [],
  wk5sun: [],
};

const data3 = {
  info: 'test #3',
  wk1mon: [],
  wk1tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk1sun: [],
  wk2mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2thu: [],
  wk2fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk2sun: [],
  wk3mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk3sun: [],
  wk4mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk4sun: [],
  wk5mon: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5tue: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk5sun: [],
};

const data4 = {
  info: 'test #4',
  wk1mon: [],
  wk1tue: [],
  wk1wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk1sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk1sun: [],
  wk2mon: [],
  wk2tue: [],
  wk2wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2thu: [],
  wk2fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk2sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk2sun: [],
  wk3mon: [],
  wk3tue: [],
  wk3wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk3sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk3sun: [],
  wk4mon: [],
  wk4tue: [],
  wk4wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk4sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk4sun: [],
  wk5mon: [],
  wk5tue: [],
  wk5wed: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5thu: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5fri: [
    { departureStoptime: { scheduledDeparture: 54540 } },
    { departureStoptime: { scheduledDeparture: 56400 } },
  ],
  wk5sat: [
    { departureStoptime: { scheduledDeparture: 57540 } },
    { departureStoptime: { scheduledDeparture: 59400 } },
  ],
  wk5sun: [],
};

const getTestData = testNumber => {
  let retData;
  switch (Number(testNumber)) {
    case 1:
      retData = data1;
      break;
    case 0:
    case 2:
      retData = data2;
      break;
    case 3:
      retData = data3;
      break;
    case 4:
      retData = data4;
      break;
    default:
      break;
  }
  return retData;
};

export default getTestData;
