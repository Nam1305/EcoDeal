import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './components/UserList';
import StoreList from './components/StoreList';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ProductDetail from './components/ProductDetail';
import StoreDetail from './components/StoreDetail';
import './App.css';

import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stores" element={<StoreList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/store/:id" element={<StoreDetail />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
