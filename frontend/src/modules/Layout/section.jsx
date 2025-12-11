import React from "react";

function Section({ title, subtitle, children }) {
  return (
    <section className="py-12">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        {title && (
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {title}
            </h2>

            {subtitle && (
              <p className="text-gray-600 mt-2 text-lg">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export default Section;
