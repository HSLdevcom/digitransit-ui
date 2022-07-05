import { PlannerMessageType } from '../../../constants';

export const ICON_CAUTION = 'icon-icon_caution';
export const ICON_INFO = 'icon-icon_info';
export const ICON_TYPE_CAUTION = 'caution';
export const ICON_TYPE_INFO = 'info';

export const ROUTER_ERROR_CODES = [
  PlannerMessageType.NoTransitConnection,
  PlannerMessageType.NoTransitConnectionInSearchWindow,
  PlannerMessageType.WalkingBetterThanTransit,
  PlannerMessageType.OutsideBounds,
  PlannerMessageType.OutsideServicePeriod,
  PlannerMessageType.LocationNotFound,
  PlannerMessageType.NoStopsInRange,
  PlannerMessageType.NoStopsInRange,
  PlannerMessageType.SystemError,
];
