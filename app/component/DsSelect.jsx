import { Select, SelectGroup, SelectOption } from '@hsl-fi/form';

const MENU_COLLISION_PADDING = 8;

/**
 * Design system Select with the application defaults.
 * See ds-select.scss for the menu styles.
 */
function DsSelect(props) {
  // The main content area starts below the app header, so using it as the
  // collision boundary keeps the menu from opening under the header.
  const boundary =
    typeof document === 'undefined'
      ? undefined
      : document.getElementById('mainContent') || undefined;

  return (
    <Select
      triggerVariant="input"
      collisionBoundary={boundary}
      collisionPadding={MENU_COLLISION_PADDING}
      {...props}
    />
  );
}

export { DsSelect, SelectGroup, SelectOption };
