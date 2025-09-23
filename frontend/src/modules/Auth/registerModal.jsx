import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../Shared/modal';
import { useAuth } from './authContext';

function RegisterModal({ isOpen, onClose, onLoginClick }) {
    const [role, setRole] = useState('TRAVELER');
    const [error, setError] = useState('');
    const { loginUser } = useAuth();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const data = Object.fromEntries(new FormData(e.target).entries());
        data.role = role;

        try {
            const response = await axios.post('http://localhost:8000/api/users/register/', data);
            loginUser(response.data, response.data.user);
            onClose();
        } catch (err) {
            const errorData = err.response?.data || {};
            const firstErrorKey = Object.keys(errorData)[0];
            let errorMessage = 'Ocurrió un error inesperado. Intenta de nuevo.';
            if (firstErrorKey) {
                const errorValue = Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : errorData[firstErrorKey];
                errorMessage = firstErrorKey !== 'detail' ? `${firstErrorKey}: ${errorValue}` : errorValue;
            }
            setError(errorMessage);
            console.error("Error de registro:", errorData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crea tu cuenta en VENTU">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex border border-gray-300 rounded-lg p-1">
                    <button type="button" onClick={() => setRole('TRAVELER')} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors ${role === 'TRAVELER' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}>Soy Viajero</button>
                    <button type="button" onClick={() => setRole('OPERATOR')} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors ${role === 'OPERATOR' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}>Soy Operador</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input name="first_name" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Nombre" />
                    <input name="last_name" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Apellido" />
                </div>
                <input name="email" type="email" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Correo electrónico" />
                <input name="username" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Nombre de usuario" />
                
                {/* --- SECCIÓN CONDICIONAL PARA OPERADORES (MEJORADA) --- */}
                {role === 'OPERATOR' && (
                    <div className="p-4 border border-orange-200 rounded-lg space-y-4 bg-orange-50/50">
                        <p className="text-sm font-semibold text-center text-orange-600">Información del Operador</p>
                        <input name="organization_name" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Nombre de la Organización" />
                        <div className="flex items-center gap-2">
                            <select name="rif_type" required className="p-2 border border-gray-300 rounded-md bg-white">
                                <option value="V">V</option>
                                <option value="E">E</option>
                                <option value="J">J</option>
                                <option value="G">G</option>
                            </select>
                            <input name="rif_number" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Número de RIF" />
                        </div>
                    </div>
                )}
                
                <input name="password" type="password" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Contraseña" />
                <input name="password2" type="password" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Confirmar contraseña" />
                
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}

                <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors">Crear Cuenta</button>
                <p className="text-center text-sm">¿Ya tienes cuenta? <button type="button" onClick={onLoginClick} className="font-semibold text-orange-500 hover:underline">Inicia Sesión</button></p>
            </form>
        </Modal>
    );
}

export default RegisterModal;