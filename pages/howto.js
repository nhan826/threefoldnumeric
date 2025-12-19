import Head from 'next/head';

export default function HowToUse() {
  return (
    <>
      <Head>
        <title>How To Use This Tool | Numeric System Visualizer</title>
        <meta name="description" content="Step-by-step guide for using the Numeric System Visualizer tool." />
      </Head>
      <main className="max-w-3xl mx-auto px-2 sm:px-4 pt-6 sm:pt-12 pb-12 text-[#232946] mb-40 overflow-x-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-[#232946] drop-shadow break-words">How To Use This Tool</h1>
        <section className="mb-4 sm:mb-8 liquid-glass p-3 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-[#232946]">1. Explore Numeric Fundamentals</h2>
          <p className="text-sm sm:text-base mb-2">Start with the <span className="font-semibold text-indigo-700">Fundamentals</span> page to understand the basics of floating point and numeric systems. Interactive diagrams and explanations help you grasp key concepts.</p>
        </section>
        <section className="mb-4 sm:mb-8 liquid-glass p-3 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-[#232946]">2. Run Benchmarks</h2>
          <p className="text-sm sm:text-base mb-2">Visit the <span className="font-semibold text-indigo-700">Benchmarks</span> page to see real-world performance comparisons. Use the provided controls to select different numeric types and operations.</p>
        </section>
        <section className="mb-4 sm:mb-8 liquid-glass p-3 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-[#232946]">3. Review Technical Summary</h2>
          <p className="text-sm sm:text-base mb-2">The <span className="font-semibold text-indigo-700">Technical Summary</span> page provides a high-level overview and links to detailed documentation and appendices.</p>
        </section>
        <section className="mb-4 sm:mb-8 liquid-glass p-3 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-[#232946]">4. Use the Sidebar Controls</h2>
          <p className="text-sm sm:text-base mb-2">Access advanced controls and settings from the right sidebar. Use the show/hide tab to keep your workspace organized.</p>
        </section>
        <section className="mb-4 sm:mb-8 liquid-glass p-3 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-[#232946]">5. Accessibility & Tips</h2>
          <ul className="list-disc pl-6 text-xs sm:text-base text-[#232946] space-y-1">
            <li>All navigation is keyboard accessible.</li>
            <li>Hover over buttons for tooltips and extra info.</li>
            <li>For best experience, use a modern browser and a large display.</li>
          </ul>
        </section>
        <section className="liquid-glass p-3 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-[#232946]">Need Help?</h2>
          <p className="text-sm sm:text-base mb-2">If you have questions or feedback, please refer to the documentation or contact the project maintainers.</p>
        </section>
      </main>
    </>
  );
}
