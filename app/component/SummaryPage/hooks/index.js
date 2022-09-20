/* eslint-disable no-console */
import { useEffect, useState } from 'react';

export const useQueryFetchingState = viewer => {
  const detectFetching = viewerData =>
    typeof viewerData.plan?.itineraries === 'undefined';

  const [isFetching, setFetching] = useState(detectFetching(viewer));

  useEffect(() => {
    console.log(
      '[useFetchingState] update state:',
      detectFetching(viewer),
      viewer,
    );
    setFetching(detectFetching(viewer));
  }, [viewer]);

  return { isFetching, setFetching };
};

export default useQueryFetchingState;
