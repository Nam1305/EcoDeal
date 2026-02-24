import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import UserList from './components/UserList';
import StoreList from './components/StoreList';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import authService from './services/authService';
import './App.css';
import { useEffect, useState } from 'react';

function Navigation() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm p-4 mb-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-700">EcoDeal</Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-600 hover:text-green-600">Home</Link>
          <Link to="/stores" className="text-gray-600 hover:text-green-600">Stores</Link>
          <Link to="/users" className="text-gray-600 hover:text-green-600">Users (Admin)</Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-green-700 font-medium">Hi, {user.fullName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-green-600 font-medium hover:underline">Login</Link>
              <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stores" element={<StoreList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
