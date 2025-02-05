import { useRef } from 'react';

const usePrevious = (value, comparingFunc) => {
  const ref = useRef({
    value,
    prev: null,
  });

  const current = ref.current.value;
  let isEqual = false;

  if (
    comparingFunc
      ? !comparingFunc(current, value)
      : JSON.stringify(value) !== JSON.stringify(current)
  ) {
    ref.current = {
      value,
      prev: current,
    };
    isEqual = true;
  }

  return { previous: ref.current.prev, isEqual };
};

export default usePrevious;
