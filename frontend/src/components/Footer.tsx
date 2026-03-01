import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                            EcoDeal
                        </span>
                        <p className="mt-6 text-gray-400 leading-relaxed">
                            Helping you save money while saving the planet. We connect you with local stores to reduce food waste and get amazing deals.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-green-400 transition">About Us</a></li>
                            <li><a href="#" className="hover:text-green-400 transition">Our Mission</a></li>
                            <li><a href="#" className="hover:text-green-400 transition">Stores</a></li>
                            <li><a href="#" className="hover:text-green-400 transition">Deals</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Support</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-green-400 transition">Help Center</a></li>
                            <li><a href="#" className="hover:text-green-400 transition">Contact Us</a></li>
                            <li><a href="#" className="hover:text-green-400 transition">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-green-400 transition">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Newsletter</h4>
                        <p className="text-sm text-gray-400 mb-4">Subscribe to get the latest deals delivered to your inbox.</p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-gray-800 border-none rounded-l-xl px-4 py-3 w-full focus:ring-1 focus:ring-green-400"
                            />
                            <button className="bg-green-600 text-white px-4 py-3 rounded-r-xl hover:bg-green-700 transition">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 flex flex-col md:row justify-between items-center text-sm">
                    <p>&copy; 2026 EcoDeal. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-green-400 transition">Facebook</a>
                        <a href="#" className="hover:text-green-400 transition">Twitter</a>
                        <a href="#" className="hover:text-green-400 transition">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
