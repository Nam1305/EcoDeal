import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './components/UserList';
import StoreList from './components/StoreList';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ProductDetail from './components/ProductDetail';
import StoreDetail from './components/StoreDetail';
import StoreOwnerDashboard from './components/StoreOwnerDashboard';
import ProductManagement from './components/ProductManagement';
import UserProfile from './components/UserProfile';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import CheckoutSuccess from './components/CheckoutSuccess';
import CheckoutCancel from './components/CheckoutCancel';
import OrderHistory from './components/OrderHistory';
import OrderDetail from './components/OrderDetail';
import WalletView from './components/WalletView';
import RegisterStore from './components/RegisterStore';
import NearbyStores from './components/NearbyStores';
import StoreSettings from './components/StoreSettings';
import 'leaflet/dist/leaflet.css';
import './App.css';

import Navbar from './components/Navbar';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <Router>
        <CartProvider>
          <div className="App min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stores" element={<StoreList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/store/:id" element={<StoreDetail />} />
          <Route path="/store-owner-dashboard" element={<StoreOwnerDashboard />} />
                <Route path="/manage-products" element={<ProductManagement />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/wallet" element={<WalletView />} />
                <Route path="/register-store" element={<RegisterStore />} />
                <Route path="/store-settings" element={<StoreSettings />} />
                <Route path="/nearby" element={<NearbyStores />} />
              </Routes>
            </main>
          </div>
        </CartProvider>
    </Router>
  );
}


export default App;
