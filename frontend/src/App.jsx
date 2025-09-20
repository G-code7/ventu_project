import { useState, useEffect } from 'react';
import axios from 'axios';
import ventuLogo from './assets/ventu-logo-orange.png';

// --- Iconos SVG para la UI ---
const SearchIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> );
const HeartIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg> );
const StarIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> );

// --- Componente: Header ---
function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
           <img 
            src={ventuLogo} 
            alt="VENTU Logo" 
            className="h-10 w-auto"
          />
        </div>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-orange-500 transition-colors">Hazte Operador</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Idioma</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Ayuda</a>
        </div>
        <div className="flex items-center space-x-2">
          <button className="hidden md:block text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors px-4 py-2 rounded-full">
            Iniciar Sesión
          </button>
          <button className="text-sm font-bold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors shadow">
            Registrarse
          </button>
        </div>
      </nav>
    </header>
  );
}

// --- Componente: Hero ---
function Hero() {
    // TODO: Implementar lógica de slider para las imágenes de fondo
    const heroImage = "https://images.unsplash.com/photo-1516088533197-2ca45740b396?q=80&w=2070&auto=format&fit=crop";
    return (
        <section 
            className="h-[500px] bg-cover bg-center text-white flex flex-col items-center justify-center relative"
            style={{ backgroundImage: `src(./assets/hero-home-bg.jpg)` }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10 text-center px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
                    Explora Venezuela
                </h1>
                <p className="text-lg md:text-xl font-light mb-8">Encuentra y reserva experiencias únicas sin complicaciones.</p>

                {/* Barra de Búsqueda Detallada (Placeholder) */}
                <div className="bg-white p-2 rounded-full shadow-2xl flex items-center space-x-2 max-w-3xl mx-auto text-sm">
                    <input type="text" placeholder="Destino" className="text-gray-700 w-1/3 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <span className="text-gray-300">|</span>
                    <input type="text" placeholder="Presupuesto" className="text-gray-700 w-1/4 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <span className="text-gray-300">|</span>
                    <input type="text" placeholder="Tipo de experiencia" className="text-gray-700 w-1/3 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <button className="bg-orange-500 text-white rounded-full p-3 hover:bg-orange-600 transition-colors">
                        <SearchIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}

// --- Componente: Tarjeta de Tour ---
function TourCard({ tour }) {
  // CORRECCIÓN 2: La API ya nos da la URL completa. No necesitamos añadir "http://localhost:8000".
  let imageUrl = 'https://placehold.co/600x400/FF7900/FFFFFF?text=VENTU';
  if (tour.images && tour.images.length > 0) {
    const mainImage = tour.images.find(img => img.is_main_image);
    imageUrl = mainImage ? mainImage.image : tour.images[0].image;
  }

  const rating = 4.8;
  const reviewCount = 25;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out group flex flex-col h-full">
      <div className="relative">
        <img className="w-full h-52 object-cover" src={imageUrl} alt={tour.title} />
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors z-10"><HeartIcon className="w-5 h-5" /></button>
        {tour.tags && tour.tags.length > 0 && (<span className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700">{tour.tags[0].name}</span>)}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors duration-200 min-h-[3.5rem]">{tour.title}</h3>
        <p className="text-sm text-gray-600 mb-3 flex-grow">{tour.description ? `${tour.description.substring(0, 70)}...` : 'Descripción no disponible.'}</p>
        <div className="flex items-center text-sm text-gray-500 mb-3">
            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="font-bold text-gray-700">{rating}</span>
            <span className="ml-1">({reviewCount} reviews)</span>
        </div>
        <hr className="my-2"/>
        <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">{tour.duration_days} día(s)</span>
            <p className="text-lg font-bold text-gray-900">Desde <span className="text-orange-500">${parseFloat(tour.price).toFixed(0)}</span></p>
        </div>
      </div>
    </div>
  );
}

// --- Componente de Sección Genérico ---
function Section({ title, viewAllLink = "#", children }) {
    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
                <a href={viewAllLink} className="text-sm font-medium text-orange-500 hover:underline">Ver todo</a>
            </div>
            {children}
        </section>
    );
}


// --- Componente Principal: App ---
function App() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos de ejemplo para secciones sin API
  const featuredDestinations = [
    { name: 'Canaima', tours: 15, image: './assets/placeholders-800x800.png' },
    { name: 'Morrocoy', tours: 25, image: './assets/placeholders-800x800.png' },
    { name: 'Los Roques', tours: 18, image: './assets/placeholders-800x800.png' },
    { name: 'Mérida', tours: 30, image: './assets/placeholders-800x800.png' }
  ];

  useEffect(() => {
    const fetchTours = async () => {
      try {
        // Asegúrate que tu backend corre en el puerto 8000
        const response = await axios.get('http://localhost:8000/api/tours/');
        setTours(response.data);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar la información de los tours. ¿Está el backend funcionando?');
        console.error("Error fetching tours:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <Hero />

      <main className="container mx-auto px-6 py-12 space-y-16">
        
        {/* --- Sección Destinos Destacados (Datos de ejemplo) --- */}
        <Section title="Destinos Destacados">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {featuredDestinations.map(dest => (
                    <div key={dest.name} className="relative rounded-lg overflow-hidden h-64 group cursor-pointer">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                            <h3 className="font-bold text-lg">{dest.name}</h3>
                            <p className="text-sm">{dest.tours} tours</p>
                        </div>
                    </div>
                ))}
            </div>
             {/* Paginación de carrusel (visual) */}
            <div className="flex justify-center mt-6 space-x-2">
                <span className="block w-8 h-1 bg-orange-500 rounded-full"></span>
                <span className="block w-8 h-1 bg-gray-300 rounded-full"></span>
                <span className="block w-8 h-1 bg-gray-300 rounded-full"></span>
            </div>
        </Section>
        
        {/* --- Sección Experiencias Populares (Datos de la API) --- */}
        <Section title="Experiencias Populares">
          {loading && <p className="text-center text-gray-600 text-lg">Cargando paquetes...</p>}
          {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </Section>
        
        {/* Aquí irían las otras secciones (Banner, Actividades, Reviews, Artículos...) */}
        
      </main>

      <footer className="bg-gray-800 text-white mt-16 py-10">
        <div className="container mx-auto text-center text-sm text-gray-400">
          <p>&copy; 2025 VENTU. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;