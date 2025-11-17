import React, { useMemo } from "react";

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
  hidePrice = false, // Nueva prop para ocultar precio
}) => {
  // Obtener los tipos de tickets disponibles DINÁMICAMENTE
  const availableTicketTypes = useMemo(() => {
    if (tour?.price_variations_with_commission && Object.keys(tour.price_variations_with_commission).length > 0) {
      return Object.keys(tour.price_variations_with_commission);
    }
    return [];
  }, [tour]);

  // Calcular el total de personas
  const totalPeople = useMemo(() => {
    return Object.values(tickets).reduce((sum, num) => sum + (parseInt(num) || 0), 0);
  }, [tickets]);

  // Calcular el total del precio
  const calculateTotal = () => {
    let total = 0;

    if (availableTicketTypes.length > 0) {
      Object.entries(tickets).forEach(([type, quantity]) => {
        const qty = parseInt(quantity) || 0;
        if (qty > 0 && tour.price_variations_with_commission[type]) {
          const priceWithCommission = parseFloat(tour.price_variations_with_commission[type]);
          total += qty * priceWithCommission;
        }
      });
    } else if (tour?.final_price) {
      const finalPrice = parseFloat(tour.final_price);
      total += totalPeople * finalPrice;
    }

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

  const formatServiceName = (name) => {
    const commonNames = {
      adulto: "Adulto",
      adultos: "Adultos",
      nino: "Niño",
      niño: "Niño",
      tercera_edad: "Tercera Edad",
      senior: "Senior",
      estudiante: "Estudiante",
      nacional: "Nacional",
      extranjero: "Extranjero",
      comidas: "Comidas",
      seguro_viaje: "Seguro de viaje",
      fotos: "Fotos",
      transporte: "Transporte",
      guia: "Guía",
      guia_privado: "Guía privado",
    };

    if (commonNames[name.toLowerCase()]) {
      return commonNames[name.toLowerCase()];
    }

    return name
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Precio - Solo si no está oculto */}
      {!hidePrice && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white text-center">
          <p className="text-sm opacity-90">Desde</p>
          <p className="text-3xl font-bold">
            ${parseFloat(tour?.final_price || 0).toFixed(0)}
            <span className="text-base font-normal opacity-90"> USD</span>
          </p>
          <p className="text-xs opacity-80">por persona</p>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">📅 Fecha del tour</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Info Encuentro - Compacto */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">🕐 Hora:</span>
            <span className="font-semibold">{tour?.meeting_time?.substring(0, 5) || "12:00"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">📍 Punto:</span>
            <span className="font-semibold text-right truncate ml-2">{tour?.meeting_point || "Por definir"}</span>
          </div>
        </div>

        {/* Participantes */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">🎫 Participantes</h4>
          {availableTicketTypes.length > 0 ? (
            <div className="space-y-2">
              {availableTicketTypes.map((type) => {
                const price = tour.price_variations_with_commission[type];
                const quantity = tickets[type] || 0;

                return (
                  <CompactTicketSelector
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
          ) : (
            <CompactPeopleSelector count={totalPeople} price={parseFloat(tour?.final_price || 0)} onChange={(newCount) => onTicketChange("default", newCount)} />
          )}
        </div>

        {/* Extras */}
        {tour?.extra_services_with_commission && Object.keys(tour.extra_services_with_commission).length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">✨ Extras opcionales</h4>
            <div className="space-y-2">
              {Object.entries(tour.extra_services_with_commission).map(([key, priceWithCommission]) => (
                <CompactServiceCheckbox
                  key={key}
                  id={key}
                  label={formatServiceName(key)}
                  price={parseFloat(priceWithCommission)}
                  checked={variableExtras[key] || false}
                  onChange={() => onVariableExtraChange(key)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-700 font-medium">Total</span>
              <p className="text-xs text-gray-500">{totalPeople} personas</p>
            </div>
            <span className="text-2xl font-bold text-orange-500">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={onReservation}
          disabled={reserving || totalPeople === 0}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reserving ? "Procesando..." : "Reservar ahora"}
        </button>

        {totalPeople === 0 && <p className="text-center text-xs text-amber-600">Selecciona al menos un participante</p>}

        <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <span className="text-green-500">✓</span>
          Cancelación gratuita hasta 24h antes
        </p>
      </div>
    </div>
  );
};

// Componentes compactos para altura reducida
const CompactTicketSelector = ({ type, price, quantity, onQuantityChange, label }) => (
  <div className="flex justify-between items-center p-2 rounded-lg border border-gray-200 hover:border-orange-300">
    <div>
      <span className="font-medium text-gray-800 text-sm">{label}</span>
      <span className="text-xs text-gray-500 ml-2">${price.toFixed(2)}</span>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
        disabled={quantity === 0}
        className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 text-sm"
      >
        -
      </button>
      <span className="font-bold w-6 text-center text-sm">{quantity}</span>
      <button
        onClick={() => onQuantityChange(quantity + 1)}
        className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 text-sm"
      >
        +
      </button>
    </div>
  </div>
);

const CompactPeopleSelector = ({ count, price, onChange }) => (
  <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200">
    <div>
      <span className="font-medium text-gray-800 text-sm">Personas</span>
      <span className="text-xs text-gray-500 ml-2">${price.toFixed(2)} c/u</span>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, count - 1))}
        disabled={count === 0}
        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 font-bold"
      >
        -
      </button>
      <span className="font-bold w-8 text-center">{count}</span>
      <button onClick={() => onChange(count + 1)} className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 font-bold">
        +
      </button>
    </div>
  </div>
);

const CompactServiceCheckbox = ({ id, label, price, checked, onChange }) => (
  <label
    className={`flex items-center justify-between cursor-pointer p-2 rounded-lg border transition-colors text-sm ${
      checked ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
    }`}
  >
    <div className="flex items-center gap-2">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
      <span className="font-medium text-gray-800">{label}</span>
    </div>
    <span className="text-gray-600 text-xs">+${price.toFixed(2)}/pers</span>
  </label>
);

export default BookingWidget;