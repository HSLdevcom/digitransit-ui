let openedCardKey = null;

/** Remembers the card that was opened, so that focus can return to it from the details view. */
export function rememberOpenedCard(key) {
  openedCardKey = key;
}

/** Focuses the button of the previously opened card, if it is in the list. */
export function restoreOpenedCardFocus(container) {
  const key = openedCardKey;
  openedCardKey = null;
  if (!key || !container) {
    return;
  }
  const button = [...container.querySelectorAll('[data-card-key]')]
    .find(card => card.dataset.cardKey === key)
    ?.querySelector('button');
  // After the page has scrolled to top
  requestAnimationFrame(() => button?.focus());
}
