import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const fluxibleContextShape = PropTypes.shape({
  getStore: PropTypes.func.isRequired,
});

const FavouriteContext = createContext([]);

export const useFavourites = () => useContext(FavouriteContext);

export function FavouriteProvider({ context, children }) {
  const [favourites, setFavourites] = useState(
    context.getStore('FavouriteStore').getFavourites(),
  );

  useEffect(() => {
    const store = context.getStore('FavouriteStore');
    const onChange = () => setFavourites(store.getFavourites());
    store.addChangeListener(onChange);
    return () => store.removeChangeListener(onChange);
  }, [context]);

  return (
    <FavouriteContext.Provider value={favourites}>
      {children}
    </FavouriteContext.Provider>
  );
}

FavouriteProvider.propTypes = {
  context: fluxibleContextShape.isRequired,
  children: PropTypes.node,
};

FavouriteProvider.defaultProps = {
  children: null,
};
