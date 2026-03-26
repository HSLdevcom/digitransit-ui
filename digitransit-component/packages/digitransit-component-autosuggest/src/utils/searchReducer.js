export const searchReducer = (state, action) => {
  switch (action.type) {
    case 'INPUT_CHANGE':
      return {
        ...state,
        value: action.value,
      };
    case 'FETCH_SUGGESTIONS':
      return {
        ...state,
        loading: action.loading,
        suggestions: action.suggestions || state.suggestions,
      };
    case 'CLEAR_SUGGESTIONS':
      return {
        ...state,
        suggestions: [],
      };
    case 'RESET_SOURCES':
      return {
        ...state,
        sources: action.sources,
      };
    case 'SET_SOURCES':
      return {
        ...state,
        showOwnPlaces: action.showOwnPlaces,
        sources: action.sources,
        pendingSelection: action.pendingSelection,
      };
    case 'CLEAR':
      return {
        ...state,
        value: '',
        isCleared: true,
        suggestions: [],
      };
    case 'INPUT_BLUR': {
      return {
        ...state,
        value: action.value || state.value,
        isCleared: action.isMobile ? false : state.isCleared,
        pendingSelection: null,
        showOwnPlaces: false,
      };
    }
    case 'RESET': {
      return action.initialState;
    }
    case 'PENDING_ENTER': {
      return {
        ...state,
        enterPending: action.enterPending,
      };
    }
    case 'TOGGLE_MENU': {
      if (action.isMobile) {
        if (!state.renderMobile) {
          return {
            ...state,
            renderMobile: true,
            value: state.isCleared ? '' : state.value,
          };
        }
        return {
          ...state,
          renderMobile: false,
          isCleared: false,
        };
      }
      return {
        ...state,
        isMenuOpen: !state.isMenuOpen,
        renderMobile: action.isMobile && !state.renderMobile,
      };
    }
    default:
      return state;
  }
};
