import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import logo from '../assets/logo.jpeg';

const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8F6FB] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-soft-pink/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
                
                {/* Logo Container */}
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-soft-pink/20 animate-bounce-slow">
                    {logo ? (
                        <img 
                            src={logo} 
                            alt="FemCare Logo" 
                            className="w-32 h-32 object-cover rounded-2xl"
                        />
                    ) : (
                        <div className="w-32 h-32 bg-soft-pink/20 rounded-2xl flex items-center justify-center">
                            <Activity className="w-16 h-16 text-deep-pink" />
                        </div>
                    )}
                </div>
            </div>

            {/* Branding */}
            <div className="mt-12 text-center animate-fade-in-up">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-3">
                    <span className="text-[#F472B6]">Fem</span>Care
                </h1>
                <p className="mt-4 text-gray-500 font-medium tracking-wide uppercase text-sm">
                    AI-Powered Women's Health
                </p>
            </div>

            {/* Loading Indicator */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-soft-pink rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-soft-pink rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-soft-pink rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
