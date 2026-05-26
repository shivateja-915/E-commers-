import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FavouritesProvider } from './context/FavouritesContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Favourites from './pages/Favourites';
import IntroVideo from './components/IntroVideo';

function App() {
  return (
    <BrowserRouter>
      <FavouritesProvider>
        <IntroVideo />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/favourites" element={<Favourites />} />
        </Routes>
      </FavouritesProvider>
    </BrowserRouter>
  );
}

export default App;
