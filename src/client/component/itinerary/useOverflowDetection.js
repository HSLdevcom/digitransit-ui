import { useLayoutEffect, useRef, useState } from 'react';

// Tells whether the content of the referenced element is wider than the element itself.
export default function useOverflowDetection() {
  const overflowRef = useRef(null);
  const [showOverflowIcon, setShowOverflowIcon] = useState(false);

  useLayoutEffect(() => {
    const container = overflowRef.current;
    if (container) {
      setShowOverflowIcon(container.clientWidth < container.scrollWidth);
    }
  }, []);

  return { overflowRef, showOverflowIcon };
}
