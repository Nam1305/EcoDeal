import React, { useEffect, useState } from 'react';
import authService from '../services/authService';

const Home: React.FC = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    return (
        <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
            <h1 className="text-4xl font-bold text-green-700 mb-4">Welcome to EcoDeal</h1>
            {user ? (
                <h2 className="text-2xl text-gray-800">Hello {user.fullName}</h2>
            ) : (
                <p className="text-xl text-gray-600">Please login to see more deals!</p>
            )}
            <div className="mt-8">
                <p className="text-gray-500 italic">Finding the best eco-friendly deals for you.</p>
            </div>
        </div>
    );
};

export default Home;
