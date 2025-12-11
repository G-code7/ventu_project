import React from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../Layout/section';
import { useAuth } from '../Auth/authContext';

function HowToStart() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    {
      number: '1',
      title: 'Regístrate como Operador',
      description:
        'Crea tu cuenta seleccionando el rol de "Operador Turístico". Completa tu perfil con información de tu empresa.',
      icon: '👤',
      action: !user ? 'Registrarse' : null,
      color: 'from-orange-400 to-orange-500',
    },
    {
      number: '2',
      title: 'Crea tu Primer Paquete',
      description:
        'Describe tu experiencia, agrega fotos atractivas, define precios y disponibilidad. ¡Es rápido y fácil!',
      icon: '📝',
      action: user?.role === 'OPERATOR' ? 'Crear Paquete' : null,
      actionLink: '/operator/create-package',
      color: 'from-blue-400 to-blue-500',
    },
    {
      number: '3',
      title: 'Gestiona tus Reservas',
      description:
        'Recibe notificaciones de nuevas reservas, comunícate con viajeros y gestiona todo desde tu dashboard.',
      icon: '📊',
      action: user?.role === 'OPERATOR' ? 'Ver Dashboard' : null,
      actionLink: '/me',
      color: 'from-green-400 to-green-500',
    },
    {
      number: '4',
      title: 'Recibe tus Pagos',
      description:
        'Obtén ingresos de cada reserva confirmada. Pagos seguros y transparentes. ¡Empieza a ganar hoy!',
      icon: '💰',
      color: 'from-purple-400 to-purple-500',
    },
  ];

  const handleAction = (step) => {
    if (step.actionLink) {
      navigate(step.actionLink);
    } else if (step.action === 'Registrarse') {
      // Aquí podrías abrir el modal de registro
      console.log('Abrir modal de registro');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-orange-50 py-16 -mx-6 px-6">
      <div className="max-w-7xl mx-auto">
        <Section title="¿Eres Operador Turístico?" subtitle="Empieza a recibir reservas en 4 simples pasos">
          {/* Steps Timeline */}
          <div className="relative">
            {/* Línea conectora - desktop */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-orange-200 via-blue-200 to-purple-200 mx-auto max-w-5xl" />

            {/* Grid de pasos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Número con gradiente */}
                  <div className="relative mb-4">
                    <div
                      className={`
                      w-20 h-20 rounded-full bg-gradient-to-br ${step.color}
                      flex items-center justify-center shadow-lg
                      group-hover:scale-110 transition-transform duration-300
                    `}
                    >
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <div
                      className={`
                      absolute -bottom-2 -right-2 w-8 h-8 rounded-full
                      bg-white border-4 border-white shadow-md
                      flex items-center justify-center
                      font-bold text-gray-700
                    `}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Contenido */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Acción si está disponible */}
                  {step.action && (
                    <button
                      onClick={() => handleAction(step)}
                      className={`
                        mt-auto px-4 py-2 rounded-full font-semibold
                        bg-gradient-to-r ${step.color} text-white
                        hover:shadow-lg transform hover:scale-105
                        transition-all duration-200
                      `}
                    >
                      {step.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Beneficios para operadores */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              ¿Por qué publicar en Ventu?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎯</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">
                    Alcance Nacional
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Conecta con viajeros de toda Venezuela buscando experiencias únicas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-3xl">💳</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">
                    Comisión Competitiva
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Solo 10% por reserva confirmada. Sin costos mensuales ni ocultos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-3xl">⚡</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">
                    Gestión Sencilla
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Dashboard intuitivo para manejar reservas, precios y disponibilidad
                  </p>
                </div>
              </div>
            </div>

            {/* CTA principal */}
            {user?.role !== 'OPERATOR' && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/operator/create-package')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="text-2xl">🚀</span>
                  Publicar mi Primera Experiencia
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
                <p className="text-gray-500 text-sm mt-3">
                  * Necesitas una cuenta de operador para publicar experiencias
                </p>
              </div>
            )}

            {user?.role === 'OPERATOR' && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/operator/create-package')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="text-2xl">🚀</span>
                  Crear Nuevo Paquete
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

export default HowToStart;
