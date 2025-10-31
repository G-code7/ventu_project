import React, { useMemo } from 'react';

const BookingWidget = ({
  tour,
  selectedDate,
  onDateChange,
  tickets,
  onTicketChange,
  extras,
  onExtraChange,
  variableExtras,
  onVariableExtraChange,
  onReservation,
  reserving,
}) => {

  // Obtener los tipos de tickets disponibles DINÁMICAMENTE
  const availableTicketTypes = useMemo(() => {
    if (tour?.price_variations_with_commission && 
        Object.keys(tour.price_variations_with_commission).length > 0) {
      return Object.keys(tour.price_variations_with_commission);
    }
    // Si no hay variaciones, no mostrar selector de tickets
    return [];
  }, [tour]);

  // Calcular el total de personas CORRECTAMENTE
  const totalPeople = useMemo(() => {
    return Object.values(tickets).reduce((sum, num) => sum + (parseInt(num) || 0), 0);
  }, [tickets]);

  // Calcular el total del precio
  const calculateTotal = () => {
    let total = 0;

    // 1. CALCULAR PRECIOS DE TICKETS
    if (availableTicketTypes.length > 0) {
      // Usar las variaciones personalizadas del operador (YA con comisión)
      Object.entries(tickets).forEach(([type, quantity]) => {
        const qty = parseInt(quantity) || 0;
        if (qty > 0 && tour.price_variations_with_commission[type]) {
          const priceWithCommission = parseFloat(tour.price_variations_with_commission[type]);
          total += qty * priceWithCommission;
        }
      });
    } else if (tour?.final_price) {
      // Fallback: si no hay variaciones pero hay final_price
      // (Este caso solo ocurre si el operador definió base_price sin variaciones)
      const finalPrice = parseFloat(tour.final_price);
      total += totalPeople * finalPrice;
    }

    // 2. SERVICIOS ADICIONALES DINÁMICOS (con comisión)
    if (tour?.extra_services_with_commission) {
      Object.entries(tour.extra_services_with_commission).forEach(([key, priceWithCommission]) => {
        if (variableExtras[key]) {
          total += parseFloat(priceWithCommission) * totalPeople;
        }
      });
    }

    return total;
  };

  const total = calculateTotal();

  // Formatear nombres de manera inteligente
  const formatServiceName = (name) => {
    const commonNames = {
      'adulto': 'Adulto',
      'adultos': 'Adultos',
      'nino': 'Niño',
      'niño': 'Niño',
      'ninos': 'Niños',
      'niños': 'Niños',
      'tercera_edad': 'Tercera Edad',
      'senior': 'Tercera Edad',
      'seniors': 'Tercera Edad',
      'estudiante': 'Estudiante',
      'estudiantes': 'Estudiantes',
      'nacional': 'Nacional',
      'extranjero': 'Extranjero',
      'adults': 'Adultos',
      'children': 'Niños',
      'comidas': 'Comidas incluidas',
      'seguro_viaje': 'Seguro de viaje',
      'seguro': 'Seguro de viaje',
      'fotos': 'Fotos profesionales',
      'transporte': 'Transporte',
      'guia': 'Guía turístico',
      'guia_privado': 'Guía privado',
    };

    if (commonNames[name.toLowerCase()]) {
      return commonNames[name.toLowerCase()];
    }

    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Obtener precio de referencia para mostrar
  const getDisplayPrice = () => {
    if (availableTicketTypes.length > 0) {
      // Mostrar el precio más bajo de las variaciones
      const prices = Object.values(tour.price_variations_with_commission).map(p => parseFloat(p));
      return Math.min(...prices).toFixed(2);
    }
    return parseFloat(tour?.final_price || 0).toFixed(2);
  };

  const displayPriceLabel = availableTicketTypes.length > 1 ? "Desde" : "";

  return (
    <div className="xl:col-span-1">
      <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border border-gray-100">
        {/* PRECIO PRINCIPAL */}
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-orange-500 mb-2">
            ${getDisplayPrice()}
          </p>
          <p className="text-gray-600 text-lg">
            {displayPriceLabel} por persona
          </p>
          {availableTicketTypes.length > 1 && (
            <p className="text-sm text-gray-500 mt-1">
              Precios varían según tipo de participante
            </p>
          )}
        </div>

        {/* SELECTOR DE FECHA */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            📅 Fecha del tour
          </label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>

        {/* INFORMACIÓN DE ENCUENTRO */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6 border border-blue-100">
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-gray-600 font-medium">🕐 Hora:</span>
            <span className="font-semibold text-gray-800">
              {tour?.meeting_time?.substring(0, 5) || '12:00'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">📍 Punto de encuentro:</span>
            <span className="font-semibold text-gray-800 text-right">
              {tour?.meeting_point || 'Por definir'}
            </span>
          </div>
        </div>

        {/* SELECTOR DE PARTICIPANTES DINÁMICO */}
        {availableTicketTypes.length > 0 ? (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg">🎫 Participantes</h4>
            <div className="space-y-4">
              {availableTicketTypes.map(type => {
                const price = tour.price_variations_with_commission[type];
                const quantity = tickets[type] || 0;
                
                return (
                  <TicketSelector
                    key={type}
                    type={type}
                    price={parseFloat(price)}
                    quantity={parseInt(quantity) || 0}
                    onQuantityChange={(newQuantity) => onTicketChange(type, newQuantity)}
                    label={formatServiceName(type)}
                  />
                );
              })}
            </div>
            
            {/* Mostrar total de personas */}
            {totalPeople > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total de personas:</span>
                  <span className="font-semibold text-gray-800">
                    {totalPeople}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Modo simple: un solo precio para todos */
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg">🎫 Participantes</h4>
            <SimplePeopleSelector
              count={totalPeople}
              price={parseFloat(tour?.final_price || 0)}
              onChange={(newCount) => onTicketChange('default', newCount)}
            />
          </div>
        )}

        {/* SERVICIOS ADICIONALES DINÁMICOS */}
        {tour?.extra_services_with_commission && Object.keys(tour.extra_services_with_commission).length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg">✨ Servicios Opcionales</h4>
            <div className="space-y-3">
              {Object.entries(tour.extra_services_with_commission).map(([key, priceWithCommission]) => (
                <ServiceCheckbox
                  key={key}
                  id={key}
                  label={formatServiceName(key)}
                  price={parseFloat(priceWithCommission)}
                  checked={variableExtras[key] || false}
                  onChange={() => onVariableExtraChange(key)}
                  perPerson={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* TOTAL */}
        <div className="border-t-2 border-gray-200 pt-6 mb-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span className="text-gray-800">Total:</span>
            <span className="text-orange-500">${total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            Precios finales (incluyen comisión de servicio)
          </p>
        </div>

        {/* BOTÓN DE RESERVA */}
        <button
          onClick={onReservation}
          disabled={reserving || totalPeople === 0}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {reserving ? 'Procesando...' : 'Reservar Ahora'}
        </button>

        {/* Mensaje si no hay personas seleccionadas */}
        {totalPeople === 0 && (
          <p className="text-center text-sm text-amber-600 mt-3">
            Selecciona al menos un participante
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-4 flex items-center justify-center gap-2">
          <span className="text-green-500">✓</span>
          Cancelación gratuita hasta 24 horas antes
        </p>
      </div>
    </div>
  );
};

// Componente para selector de tickets (con variaciones)
const TicketSelector = ({ type, price, quantity, onQuantityChange, label }) => (
  <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
    <div className="flex-1">
      <span className="font-medium text-gray-800 block">{label}</span>
      <span className="text-sm text-gray-600">${price.toFixed(2)} c/u</span>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
        disabled={quantity === 0}
        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={`Disminuir ${label}`}
      >
        -
      </button>
      <span className="font-bold w-8 text-center text-gray-800">{quantity}</span>
      <button
        onClick={() => onQuantityChange(quantity + 1)}
        className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
        aria-label={`Aumentar ${label}`}
      >
        +
      </button>
    </div>
  </div>
);

// Componente simple cuando NO hay variaciones (precio único)
const SimplePeopleSelector = ({ count, price, onChange }) => (
  <div className="flex justify-between items-center p-4 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors">
    <div className="flex-1">
      <span className="font-medium text-gray-800 block">Número de personas</span>
      <span className="text-sm text-gray-600">${price.toFixed(2)} por persona</span>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(0, count - 1))}
        disabled={count === 0}
        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-bold"
      >
        -
      </button>
      <span className="font-bold w-10 text-center text-gray-800 text-xl">{count}</span>
      <button
        onClick={() => onChange(count + 1)}
        className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors text-lg font-bold"
      >
        +
      </button>
    </div>
  </div>
);

// Componente para servicios adicionales
const ServiceCheckbox = ({ id, label, price, checked, onChange, perPerson = false }) => (
  <label 
    className={`flex items-center justify-between cursor-pointer p-3 rounded-lg border-2 transition-colors ${
      checked 
        ? 'border-orange-500 bg-orange-50' 
        : 'border-gray-200 hover:border-orange-300'
    }`}
  >
    <div className="flex items-center gap-3 flex-1">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
      />
      <div className="flex-1">
        <span className="font-medium text-gray-800 block">{label}</span>
        <span className="text-sm text-gray-600">
          +${price.toFixed(2)} {perPerson ? 'por persona' : ''}
        </span>
      </div>
    </div>
  </label>
);

export default BookingWidget;