import { Select, SelectGroup, SelectOption } from '@hsl-fi/form';

// Keep the menu clear of the top bar (50px on mobile)
const MENU_COLLISION_PADDING = { top: 60, bottom: 8 };

/**
 * Design system Select with the application defaults.
 * See ds-select.scss for the menu styles.
 */
function DsSelect(props) {
  return (
    <Select
      triggerVariant="input"
      collisionPadding={MENU_COLLISION_PADDING}
      {...props}
    />
  );
}

export { DsSelect, SelectGroup, SelectOption };
