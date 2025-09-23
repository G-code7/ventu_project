import React from 'react';
import { XIcon } from './icons';

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {

        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{title}</h2>
                {children}
            </div>
        </div>
    );
}

export default Modal;