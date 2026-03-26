import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookSlot from './pages/BookSlot';
import MyBookings from './pages/MyBookings';
import EntryExit from './pages/EntryExit';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import { useState, useEffect } from 'react';
import { getMe } from './utils/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Smart Parking...</p>
      </div>
    );
  }

  return (
    <Router>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <div className="app-container">
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard user={user} />) : <Navigate to="/login" />}
          />
          <Route
            path="/book"
            element={user ? <BookSlot user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-bookings"
            element={user ? <MyBookings user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/entry-exit"
            element={user ? <EntryExit /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
      {user && <Chatbot />}
    </Router>
  );
}

export default App;
