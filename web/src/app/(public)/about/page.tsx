export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">About Delala</h1>
        <p className="text-lg text-slate-600 mb-6">
          Delala is Ethiopia's premier property rental and sales platform, connecting verified property owners with renters and buyers across the country.
        </p>
        <p className="text-slate-600 mb-6">
          Our platform provides a transparent, secure, and easy-to-use marketplace for residential properties. We verify both property owners and their documents to ensure a trusted experience for all users.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {[
            { title: 'Our Mission', desc: 'Make property search and rental transparent and accessible for all Ethiopians.' },
            { title: 'Our Vision', desc: 'Become the most trusted property marketplace in East Africa.' },
            { title: 'For Owners', desc: 'List your property, manage rental requests, and find verified renters easily.' },
            { title: 'For Renters', desc: 'Browse thousands of verified properties across Ethiopia, contact owners directly.' },
          ].map((item) => (
            <div key={item.title} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h2>
              <p className="text-slate-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
