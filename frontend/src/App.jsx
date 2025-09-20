import { useState, useEffect } from 'react';
import axios from 'axios';
// NOTA: Asegúrate de tener tu logo y la imagen de fondo en la carpeta `src/assets`
import ventuLogo from './assets/ventu-logo-orange.png';
import heroImage from './assets/hero-home-bg.jpg';


// --- Iconos SVG para la UI ---
const SearchIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> );
const HeartIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg> );
const StarIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> );
const ChevronLeftIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg> );
const ChevronRightIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg> );


// --- Componente: Header ---
function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img src={ventuLogo} alt="VENTU Logo" className="h-10 w-auto" />
        </div>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-orange-500 transition-colors">Hazte Operador</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Idioma</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Ayuda</a>
        </div>
        <div className="flex items-center space-x-2">
          <button className="hidden md:block text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors px-4 py-2 rounded-full">Iniciar Sesión</button>
          <button className="text-sm font-bold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors shadow">Registrarse</button>
        </div>
      </nav>
    </header>
  );
}

// --- Componente: Hero ---
function Hero() {
    return (
        <section 
            className="h-[500px] bg-cover bg-center text-white flex flex-col items-center justify-center relative"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10 text-center px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>Explora Venezuela</h1>
                <p className="text-lg md:text-xl font-light mb-8">Encuentra y reserva experiencias únicas sin complicaciones.</p>
                <div className="bg-white p-2 rounded-full shadow-2xl flex items-center space-x-2 max-w-3xl mx-auto text-sm">
                    <input type="text" placeholder="Destino" className="text-gray-700 w-1/3 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <span className="text-gray-300">|</span>
                    <input type="text" placeholder="Presupuesto" className="text-gray-700 w-1/4 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <span className="text-gray-300">|</span>
                    <input type="text" placeholder="Tipo de experiencia" className="text-gray-700 w-1/3 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <button className="bg-orange-500 text-white rounded-full p-3 hover:bg-orange-600 transition-colors"><SearchIcon className="w-5 h-5" /></button>
                </div>
            </div>
        </section>
    );
}

// --- Componente: Tarjeta de Tour ---
function TourCard({ tour }) {
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

// --- Componente: Sección Genérica con Título ---
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

// --- Componente: Carrusel de Destinos Destacados ---
function FeaturedDestinations() {
  // Datos de ejemplo hasta que tengamos una API para esto
  const destinations = [
    { name: 'Canaima', tours: 15, image: './assets/placeholders-800x800.png' },
    { name: 'Morrocoy', tours: 25, image: './assets/placeholders-800x800.png' },
    { name: 'Los Roques', tours: 18, image: './assets/placeholders-800x800.png' },
    { name: 'Mérida', tours: 30, image: './assets/placeholders-800x800.png' },
    { name: 'La Gran Sabana', tours: 12, image: './assets/placeholders-800x800.png' },
    { name: 'Margarita', tours: 40, image: './assets/placeholders-800x800.png' },
    { name: 'Choroní', tours: 22, image: './assets/placeholders-800x800.png' },
    { name: 'Roraima', tours: 8, image: './assets/placeholders-800x800.png' }
  ];

  const ITEMS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(destinations.length / ITEMS_PER_PAGE);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const selectedDestinations = destinations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Section title="Destinos Destacados">
      <div className="relative">
        {/* Contenedor del carrusel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {selectedDestinations.map(dest => (
                <div key={dest.name} className="flex flex-col items-center text-center group cursor-pointer">
                    <div className="w-32 h-32 md:w-40 md:h-40 mb-4">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover rounded-full shadow-md transform group-hover:scale-110 transition-transform duration-300"/>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{dest.name}</h3>
                    <p className="text-sm text-gray-500">{dest.tours} experiencias</p>
                </div>
            ))}
        </div>
        
        {/* Controles de Navegación */}
        <button onClick={handlePrev} className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-gray-600"/>
        </button>
        <button onClick={handleNext} className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
          <ChevronRightIcon className="w-6 h-6 text-gray-600"/>
        </button>
      </div>

      {/* Paginación de carrusel (visual y funcional) */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button key={index} onClick={() => setCurrentPage(index)} className={`block w-8 h-1 rounded-full ${currentPage === index ? 'bg-orange-500' : 'bg-gray-300'}`}></button>
        ))}
      </div>
    </Section>
  );
}


// --- Componente Principal: App ---
function App() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/tours/');
        setTours(response.data);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar la información. Revisa la consola y los logs de Docker.');
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
        
        <FeaturedDestinations />
        
        <Section title="Experiencias Populares">
          {loading && <p className="text-center text-gray-600 text-lg">Cargando paquetes...</p>}
          {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tours.map(tour => (<TourCard key={tour.id} tour={tour} />))}
          </div>
        </Section>
        
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