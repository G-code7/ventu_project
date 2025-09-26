import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../Shared/modal';
// Ya no necesitamos 'useAuth' aquí porque el registro no inicia sesión.

function RegisterModal({ isOpen, onClose, onLoginClick }) {
    const [role, setRole] = useState('TRAVELER');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.role = role;

        // Limpiamos los campos del RIF si el rol no es OPERATOR para evitar errores de validación
        if (role !== 'OPERATOR') {
            delete data.organization_name;
            delete data.rif_type;
            delete data.rif_number;
        }

        try {
            await axios.post('http://localhost:8000/api/auth/registration/', data);
            setSuccessMessage('¡Registro exitoso! Por favor, inicia sesión para continuar.');
        } catch (err) {
            const errorData = err.response?.data || {};
            console.error("Error de registro:", errorData);
            
            let errorMessage = 'Ocurrió un error. Por favor, intenta de nuevo.';
            const firstErrorKey = Object.keys(errorData)[0];
            if (firstErrorKey) {
                const errorValue = Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : errorData[firstErrorKey];
                errorMessage = `${firstErrorKey}: ${errorValue}`;
            }
            setError(errorMessage);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crea tu cuenta en VENTU">
            {successMessage ? (
                <div className="text-center p-4">
                    <p className="text-green-700 font-semibold">{successMessage}</p>
                    <button 
                        onClick={onLoginClick} 
                        className="mt-4 w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Ir a Iniciar Sesión
                    </button>
                </div>
            ) : (
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
                    
                    {role === 'OPERATOR' && (
                        <div className="p-4 border border-orange-200 rounded-lg space-y-4 bg-orange-50/50">
                            <p className="text-sm font-semibold text-center text-orange-600">Información del Operador</p>
                            <input name="organization_name" required={role === 'OPERATOR'} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Nombre de la Organización" />
                            <div className="flex items-center gap-2">
                                <select name="rif_type" required={role === 'OPERATOR'} className="p-2 border border-gray-300 rounded-md bg-white">
                                    <option value="V">V</option>
                                    <option value="E">E</option>
                                    <option value="J">J</option>
                                    <option value="G">G</option>
                                </select>
                                <input name="rif_number" required={role === 'OPERATOR'} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Número de RIF" />
                            </div>
                        </div>
                    )}
                    
                    <input name="password1" type="password" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Contraseña" />
                    <input name="password2" type="password" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Confirmar contraseña" />
                    
                    {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}

                    <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors">Crear Cuenta</button>
                    <p className="text-center text-sm">¿Ya tienes cuenta? <button type="button" onClick={onLoginClick} className="font-semibold text-orange-500 hover:underline">Inicia Sesión</button></p>
                </form>
            )}
        </Modal>
    );
}

export default RegisterModal;
