import { createMemoryHistory } from 'react-router';

const mockRouter = {
  push: () => {},
  replace: () => {},
  go: () => {},
  goBack: () => {},
  goForward: () => {},
  setRouteLeaveHook: () => {},
  isActive: () => {},
  getCurrentLocation: () => ({}),
};

export const createMemoryMockRouter = () => ({
  ...mockRouter,
  ...createMemoryHistory(),
});

export default mockRouter;
