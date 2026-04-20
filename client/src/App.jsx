import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage.jsx';
import ListingPage from './pages/ListingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ListPropertyPage from './pages/ListPropertyPage.jsx';
import Nav from './components/Nav.jsx';

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedListing, setSelectedListing] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const navigate = (to, data = null) => {
    setPage(to);
    if (data) setSelectedListing(data);
    window.scrollTo(0, 0);
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigate('home');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('home');
  };

  return (
    <div>
      <Nav user={user} navigate={navigate} logout={logout} />
      {page === 'home' && (
        <HomePage navigate={navigate} user={user} />
      )}
      {page === 'listing' && (
        <ListingPage listing={selectedListing} navigate={navigate} user={user} />
      )}
      {page === 'auth' && (
        <AuthPage login={login} navigate={navigate} />
      )}
      {page === 'list-property' && (
        <ListPropertyPage navigate={navigate} user={user} />
      )}
    </div>
  );
}
