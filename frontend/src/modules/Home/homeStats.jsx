import React from 'react';

function HomeStats() {
    const stats = [
        { 
            number: "500+", 
            label: "Viajeros felices",
            icon: "😊"
        },
        { 
            number: "100+", 
            label: "Experiencias únicas",
            icon: "🎯"
        },
        { 
            number: "24", 
            label: "Estados de Venezuela",
            icon: "📍"
        },
        { 
            number: "50+", 
            label: "Operadores verificados",
            icon: "✅"
        }
    ];

    return (
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-12 -mx-6 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                {stat.number}
                            </div>
                            <div className="text-orange-100 text-sm md:text-base font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HomeStats;
