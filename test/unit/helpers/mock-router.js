const mockMatcher = {
  routeConfig: [],
  match: () => {},
  getRoutes: () => {},
  isActive: () => {},
  format: () => {},
};

export const mockRouter = {
  push: () => {},
  replace: () => {},
  go: () => {},
  createHref: () => {},
  createLocation: () => {},
  addTransitionHook: () => {},
  matcher: mockMatcher,
  replaceRouteConfig: () => {},
  isActive: () => {},
};

export const mockMatch = {
  location: {
    action: '',
    pathname: '',
    search: '',
    hash: '',
    index: 0,
    delta: 0,
    query: {},
  },
  routeIndices: [],
  routeParams: {},
  params: {},
  routes: [],
  router: mockRouter,
  route: {
    getComponent: () => {},
  },
};
