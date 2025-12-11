import React from 'react';
import Section from '../Layout/section';
import {
  CheckIcon,
  ShieldCheckIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  CreditCardIcon,
} from '../Shared/icons';

function WhyVentu() {
  const benefits = [
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: 'Operadores Verificados',
      description:
        'Todos nuestros operadores pasan un proceso de verificación para garantizar tu seguridad y calidad.',
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      icon: <CreditCardIcon className="w-8 h-8" />,
      title: 'Reserva Segura',
      description:
        'Sistema de pagos confiable con protección al consumidor. Tu dinero está seguro con nosotros.',
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200',
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: 'Ahorra Tiempo',
      description:
        'Compara y reserva experiencias en minutos. Todo en un solo lugar, sin complicaciones.',
      color: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-200',
    },
    {
      icon: <StarIcon className="w-8 h-8" />,
      title: 'Reviews Reales',
      description:
        'Lee opiniones de viajeros como tú. Toma decisiones informadas basadas en experiencias reales.',
      color: 'bg-yellow-50 text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: 'Soporte Dedicado',
      description:
        'Nuestro equipo está disponible para ayudarte antes, durante y después de tu experiencia.',
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200',
    },
    {
      icon: <CheckIcon className="w-8 h-8" />,
      title: 'Sin Costos Ocultos',
      description:
        'Precios transparentes. Lo que ves es lo que pagas, sin sorpresas en el checkout.',
      color: 'bg-pink-50 text-pink-600',
      borderColor: 'border-pink-200',
    },
  ];

  return (
    <Section title="¿Por qué elegir Ventu?">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className={`
              relative p-6 rounded-2xl border-2 ${benefit.borderColor}
              hover:shadow-xl transition-all duration-300
              transform hover:-translate-y-1
              bg-white
            `}
          >
            {/* Icono */}
            <div
              className={`
              ${benefit.color} w-16 h-16 rounded-xl
              flex items-center justify-center mb-4
              shadow-md
            `}
            >
              {benefit.icon}
            </div>

            {/* Contenido */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {benefit.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {benefit.description}
            </p>

            {/* Decoración */}
            <div
              className={`
              absolute top-0 right-0 w-20 h-20 -mt-2 -mr-2
              rounded-full opacity-10 ${benefit.color}
              blur-2xl
            `}
            />
          </div>
        ))}
      </div>

      {/* CTA inferior */}
      <div className="mt-12 text-center">
        <div className="inline-block bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 border border-orange-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            ¿Listo para tu próxima aventura?
          </h3>
          <p className="text-gray-600 mb-4">
            Únete a miles de viajeros que ya descubrieron Venezuela con Ventu
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <CheckIcon className="w-5 h-5 text-green-500" />
              Registro gratis
            </span>
            <span className="flex items-center gap-1">
              <CheckIcon className="w-5 h-5 text-green-500" />
              Sin compromiso
            </span>
            <span className="flex items-center gap-1">
              <CheckIcon className="w-5 h-5 text-green-500" />
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default WhyVentu;
