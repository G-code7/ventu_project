import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../Shared/modal';
import { useAuth } from './authContext';

function LoginModal({ isOpen, onClose, onRegisterClick }) {
    const [error, setError] = useState('');
    const { loginUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const data = Object.fromEntries(new FormData(e.target).entries());
        try {
            const tokenResponse = await axios.post('http://localhost:8000/api/token/', data);
            const userProfileResponse = await axios.get('http://localhost:8000/api/users/me/', {
                headers: { 'Authorization': `Bearer ${tokenResponse.data.access}` }
            });
            loginUser(tokenResponse.data, userProfileResponse.data);
            onClose();
        } catch (err) {
            setError("Credenciales inválidas. Por favor, intenta de nuevo.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bienvenido de vuelta">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="email" type="email" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Correo electrónico" />
                <input name="password" type="password" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Contraseña" />
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg">Iniciar Sesión</button>
                <p className="text-center text-sm">¿No tienes cuenta? <button type="button" onClick={onRegisterClick} className="font-semibold text-orange-500 hover:underline">Regístrate</button></p>
            </form>
        </Modal>
    );
}
export default LoginModal;