import React from 'react';

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

export default Section;