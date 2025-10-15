import React from 'react';

function Section({ title, children }) {
  return (
    <section className="py-12">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}

export default Section;
