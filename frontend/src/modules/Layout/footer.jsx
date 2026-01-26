import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaFacebookF, 
    FaInstagram, 
    FaTwitter, 
    FaYoutube,
    FaTiktok,
    FaChevronDown,
    FaChevronUp,
    FaHeadset,
    FaMapMarkerAlt,
    FaEnvelope,
    FaWhatsapp
} from 'react-icons/fa';

function Footer() {
    // Estado para dropdowns en mobile
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const FooterSection = ({ title, children, sectionKey }) => (
        <div className="border-b border-gray-700 md:border-none">
            {/* Header - clickeable en mobile */}
            <button 
                className="w-full flex justify-between items-center py-4 md:py-0 md:cursor-default"
                onClick={() => toggleSection(sectionKey)}
            >
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
                    {title}
                </h4>
                <span className="md:hidden text-gray-400">
                    {openSections[sectionKey] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
            </button>
            
            {/* Content - siempre visible en desktop, toggle en mobile */}
            <ul className={`
                space-y-3 pb-4 md:pb-0 md:mt-4
                ${openSections[sectionKey] ? 'block' : 'hidden'} 
                md:block
            `}>
                {children}
            </ul>
        </div>
    );

    const FooterLink = ({ to, children, external = false }) => (
        <li>
            {external ? (
                <a 
                    href={to} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                    {children}
                </a>
            ) : (
                <Link 
                    to={to} 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                    {children}
                </Link>
            )}
        </li>
    );

    return (
        <footer className="bg-[#1a1a2e] text-white mt-16">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    
                    {/* Columna 1: VENTU */}
                    <FooterSection title="Ventu" sectionKey="ventu">
                        <FooterLink to="/nosotros">Quiénes somos</FooterLink>
                        <FooterLink to="/como-funciona">Cómo funciona</FooterLink>
                        <FooterLink to="/sostenibilidad">Sostenibilidad</FooterLink>
                        <FooterLink to="/prensa">Prensa</FooterLink>
                    </FooterSection>

                    {/* Columna 2: Inspiración */}
                    <FooterSection title="Inspiración" sectionKey="inspiracion">
                        <FooterLink to="/destinos">Destinos</FooterLink>
                        <FooterLink to="/experiencias">Experiencias</FooterLink>
                        <FooterLink to="/blog" external>Blog de viajes</FooterLink>
                        <FooterLink to="/guias">Guías turísticas</FooterLink>
                    </FooterSection>

                    {/* Columna 3: Trabaja con nosotros */}
                    <FooterSection title="Trabaja con nosotros" sectionKey="trabaja">
                        <FooterLink to="/operadores">Soy operador turístico</FooterLink>
                        <FooterLink to="/afiliados">Programa de afiliados</FooterLink>
                        <FooterLink to="/agencias">Agencias de viajes</FooterLink>
                        <FooterLink to="/empleo">Empleo</FooterLink>
                    </FooterSection>

                    {/* Columna 4: Ayuda */}
                    <div className="border-b border-gray-700 md:border-none">
                        <button 
                            className="w-full flex justify-between items-center py-4 md:py-0 md:cursor-default"
                            onClick={() => toggleSection('ayuda')}
                        >
                            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
                                Ayuda
                            </h4>
                            <span className="md:hidden text-gray-400">
                                {openSections['ayuda'] ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                        </button>
                        
                        <div className={`
                            pb-4 md:pb-0 md:mt-4 space-y-4
                            ${openSections['ayuda'] ? 'block' : 'hidden'} 
                            md:block
                        `}>
                            {/* Card de contacto */}
                            <div className="bg-[#252542] rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                        <FaHeadset className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">¿Necesitas ayuda?</p>
                                        <p className="text-gray-400 text-xs">Disponibles 24/7</p>
                                    </div>
                                </div>
                                <Link 
                                    to="/contacto" 
                                    className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded-lg transition-colors"
                                >
                                    Contactar
                                </Link>
                            </div>
                            
                            <ul className="space-y-2">
                                <FooterLink to="/faq">Preguntas frecuentes</FooterLink>
                                <FooterLink to="/politica-cancelacion">Política de cancelación</FooterLink>
                            </ul>
                        </div>
                    </div>

                    {/* Columna 5: Valoraciones y Redes */}
                    <div className="border-b border-gray-700 md:border-none">
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider py-4 md:py-0">
                            Cómo nos valoran
                        </h4>
                        
                        <div className="md:mt-4 pb-4 md:pb-0">
                            {/* Rating Card */}
                            <div className="bg-[#252542] rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl font-bold text-white">4.8</span>
                                    <span className="text-gray-400 text-sm">/5</span>
                                </div>
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span 
                                            key={star} 
                                            className={`text-lg ${star <= 4 ? 'text-yellow-400' : 'text-yellow-400/50'}`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className="text-gray-400 text-xs">
                                    +<span className="font-medium">1,000</span> opiniones verificadas
                                </p>
                            </div>

                            {/* Redes Sociales */}
                            <h5 className="text-white font-semibold text-sm mb-3">Síguenos</h5>
                            <div className="flex gap-3">
                                <a 
                                    href="https://facebook.com/ventu" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-[#252542] hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
                                    title="Facebook"
                                >
                                    <FaFacebookF className="text-white text-sm" />
                                </a>
                                <a 
                                    href="https://instagram.com/ventu" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-[#252542] hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
                                    title="Instagram"
                                >
                                    <FaInstagram className="text-white text-sm" />
                                </a>
                                <a 
                                    href="https://twitter.com/ventu" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-[#252542] hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
                                    title="Twitter"
                                >
                                    <FaTwitter className="text-white text-sm" />
                                </a>
                                <a 
                                    href="https://tiktok.com/@ventu" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-[#252542] hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
                                    title="TikTok"
                                >
                                    <FaTiktok className="text-white text-sm" />
                                </a>
                                <a 
                                    href="https://youtube.com/ventu" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-[#252542] hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
                                    title="YouTube"
                                >
                                    <FaYoutube className="text-white text-sm" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Métodos de pago */}
                <div className="mt-10 pt-8 border-t border-gray-700">
                    <h5 className="text-white font-semibold text-sm mb-4 text-center md:text-left">
                        Métodos de pago
                    </h5>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        {/* Iconos de pago - usando placeholders */}
                        <div className="h-8 px-4 bg-white rounded flex items-center justify-center">
                            <span className="text-gray-800 text-xs font-bold">VISA</span>
                        </div>
                        <div className="h-8 px-4 bg-white rounded flex items-center justify-center">
                            <span className="text-gray-800 text-xs font-bold">Mastercard</span>
                        </div>
                        <div className="h-8 px-4 bg-[#003087] rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">PayPal</span>
                        </div>
                        <div className="h-8 px-4 bg-white rounded flex items-center justify-center">
                            <span className="text-gray-800 text-xs font-bold">Zelle</span>
                        </div>
                        <div className="h-8 px-4 bg-green-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">Pago Móvil</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#12121f] py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Logo y Copyright */}
                        <div className="flex items-center gap-3">
                            <Link to="/" className="text-2xl font-bold text-orange-500">
                                VENTU
                            </Link>
                            <span className="text-gray-500 text-sm">
                                © {new Date().getFullYear()} Todos los derechos reservados
                            </span>
                        </div>

                        {/* Links legales */}
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <Link to="/terminos" className="text-gray-400 hover:text-white transition-colors">
                                Términos y condiciones
                            </Link>
                            <Link to="/privacidad" className="text-gray-400 hover:text-white transition-colors">
                                Política de privacidad
                            </Link>
                            <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                                Cookies
                            </Link>
                        </div>
                    </div>

                    {/* Mensaje de Venezuela */}
                    <div className="mt-4 text-center">
                        <p className="text-gray-500 text-xs flex items-center justify-center gap-2">
                            <FaMapMarkerAlt className="text-orange-500" />
                            Hecho con ❤️ en Venezuela para el mundo
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;