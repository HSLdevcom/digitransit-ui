import React from 'react';

import Checkbox from '../Checkbox';

const getBikeTransportOptions = () => [
  {
    name: 'biketransport-only-bike',
    defaultMessage: "I'm travelling only by bike",
  },
  {
    name: 'biketransport-citybike',
    defaultMessage: "I'm using a citybike",
  },
  {
    name: 'biketransport-keep-bike-with',
    defaultMessage: 'I want to keep my bike with me',
  },
];

const BikeTransportOptionsSection = () =>
  getBikeTransportOptions().map(o => (
    <Checkbox
      checked={false}
      defaultMessage={o.defaultMessage}
      key={`cb-${o.name}`}
      labelId={o.name}
      onChange={() => console.log(o.name)}
    />
  ));

export default BikeTransportOptionsSection;
