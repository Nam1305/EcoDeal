import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

export interface CartItem {
    cartItemId: number;
    productId: number;
    productName: string;
    price: number;
    imageUrl: string;
    quantity: number;
    subTotal: number;
}

export interface Cart {
    cartId: number;
    userId: number;
    items: CartItem[];
    totalAmount: number;
}

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    fetchCart: () => Promise<void>;
    addToCart: (productId: number, quantity: number) => Promise<void>;
    updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
    removeFromCart: (cartItemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchCart = async () => {
        if (!user) {
            setCart(null);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await cartService.getCart();
            setCart(data);
        } catch (error) {
            console.error('Failed to fetch cart', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (productId: number, quantity: number) => {
        try {
            const data = await cartService.addItem(productId, quantity);
            setCart(data);
        } catch (error) {
            console.error('Failed to add to cart', error);
            throw error;
        }
    };

    const updateQuantity = async (cartItemId: number, quantity: number) => {
        try {
            const data = await cartService.updateItemQuantity(cartItemId, quantity);
            setCart(data);
        } catch (error) {
            console.error('Failed to update quantity', error);
        }
    };

    const removeFromCart = async (cartItemId: number) => {
        try {
            const data = await cartService.removeItem(cartItemId);
            setCart(data);
        } catch (error) {
            console.error('Failed to remove from cart', error);
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clearCart();
            setCart(null); // or fetchCart() to get empty cart
            await fetchCart();
        } catch (error) {
            console.error('Failed to clear cart', error);
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
