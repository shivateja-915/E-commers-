import React, { createContext, useContext, useState, useEffect } from 'react';

const FavouritesContext = createContext();

export const useFavourites = () => {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used inside FavouritesProvider');
  return ctx;
};

export const FavouritesProvider = ({ children }) => {
  const [favourites, setFavourites] = useState(() => {
    try {
      const stored = localStorage.getItem('favourites');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('favourites', JSON.stringify(favourites));
  }, [favourites]);

  const toggleFavourite = (id) => {
    setFavourites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const isFavourite = (id) => favourites.includes(id);

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};
