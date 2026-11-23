import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { ArrowLinkButton } from '@hsl-fi/navigation';
import Card from '../Card';
import { isOpenedCard, rememberOpenedCard } from './cardFocus';

/** Clickable card with a header and an arrow button. Takes focus when returning from its details. */
export default function DisruptionCardShell({ cardKey, headerLeft, ariaLabel, onOpen, children }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpenedCard(cardKey)) {
      // After the page has scrolled to top
      requestAnimationFrame(() => cardRef.current?.querySelector('button')?.focus());
    }
  }, []);

  return (
    <Card
      ref={cardRef}
      className="disruption-card clickable"
      onClick={() => {
        rememberOpenedCard(cardKey);
        onOpen();
      }}
    >
      <header>
        <span className="disruption-card__header-left">{headerLeft}</span>
        <ArrowLinkButton size="m" aria-label={ariaLabel} />
      </header>
      {children}
    </Card>
  );
}

DisruptionCardShell.propTypes = {
  cardKey: PropTypes.string,
  headerLeft: PropTypes.node.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  onOpen: PropTypes.func.isRequired,
  children: PropTypes.node,
};
