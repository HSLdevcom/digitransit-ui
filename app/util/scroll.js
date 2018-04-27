import { isBrowser } from './browser';

export default function scrollTop() {
  if (isBrowser) {
    window.scrollTo(0, 0);
  }
}
