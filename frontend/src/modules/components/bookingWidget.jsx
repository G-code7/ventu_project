import React from 'react';
import { MapPinIcon, CalendarIcon } from "../Shared/icons";

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
  pricing
}) => {
  const calculateTotal = () => {
    if (!pricing) return 0;
    
    let total = 0;
    const basePrice = pricing.finalPrice;

    // Precio por tickets
    total += tickets.adults * basePrice;
    total += tickets.seniors * (basePrice * 0.7);
    total += tickets.children * (basePrice * 0.5);

    // Extras fijos
    const extrasPrice = 40;
    const totalPeople = tickets.adults + tickets.seniors + tickets.children;

    if (extras.meals) total += extrasPrice * totalPeople;
    if (extras.travel_insurance) total += extrasPrice * totalPeople;

    // Extras variables
    if (tour?.variable_prices) {
      Object.entries(tour.variable_prices).forEach(([key, price]) => {
        if (variableExtras[key]) {
          const priceNumber = parseFloat(price) || 0;
          total += priceNumber * totalPeople;
        }
      });
    }

    return total;
  };

  const total = calculateTotal();

  return (
    <div className="xl:col-span-1">
      <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border border-gray-100">
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-orange-500 mb-2">
            ${pricing?.formattedFinalPrice || '0'}
          </p>
          <p className="text-gray-600 text-lg">por persona</p>
        </div>

        {/* Selector de fecha */}
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

        {/* Información de encuentro */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6 border border-blue-100">
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-gray-600 font-medium">🕐 Hora de encuentro:</span>
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

        {/* Selector de tickets - Mantener igual que antes */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-4 text-lg">🎫 Tickets</h4>
          <div className="space-y-4">
            {/* ... (mantener la lógica de tickets igual) */}
          </div>
        </div>

        {/* Extras adicionales */}
        {tour?.variable_prices && Object.keys(tour.variable_prices).length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg">✨ Opciones adicionales</h4>
            <div className="space-y-4">
              {Object.entries(tour.variable_prices).map(([key, price]) => (
                <label
                  key={key}
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <div>
                    <span className="font-medium text-gray-800 capitalize">
                      {key.trim().toLowerCase()}
                    </span>
                    <p className="text-sm text-gray-600">
                      +${parseFloat(price).toFixed(2)} por persona
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={variableExtras[key] || false}
                    onChange={() => onVariableExtraChange(key)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="border-t-2 border-gray-200 pt-6 mb-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span className="text-gray-800">Total:</span>
            <span className="text-orange-500">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Botón de reserva */}
        <button
          onClick={onReservation}
          disabled={reserving}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {reserving ? 'Procesando...' : 'Reservar Ahora'}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4 flex items-center justify-center gap-2">
          <span className="text-green-500">✓</span>
          Cancelación gratuita hasta 24 horas antes
        </p>
      </div>
    </div>
  );
};

export default BookingWidget;