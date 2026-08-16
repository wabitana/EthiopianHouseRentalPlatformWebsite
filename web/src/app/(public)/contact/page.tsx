export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Contact Us</h1>
        <p className="text-slate-600 mb-10">Have a question or need help? Reach out to us through the channels below.</p>
        <div className="space-y-6">
          {[
            { label: 'Email', value: 'support@delala.et' },
            { label: 'Phone', value: '+251 911 000 000' },
            { label: 'Address', value: 'Addis Ababa, Ethiopia' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-slate-900 font-semibold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
