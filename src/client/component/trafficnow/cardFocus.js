let openedCardKey = null;

/** Remembers the card that was opened, so that focus can return to it from the details view. */
export function rememberOpenedCard(key) {
  openedCardKey = key;
}

/** True if the card was the last one opened. */
export function isOpenedCard(key) {
  return !!key && key === openedCardKey;
}

export function clearOpenedCard() {
  openedCardKey = null;
}
