import { CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h6 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">About Us</h6>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Welcome to Delala Home Rentals</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            We are Ethiopia's leading digital home rental and property services platform. 
            Our commitment to verified listings, digital lease transparency, and tenant satisfaction makes us the trusted rental partner across Ethiopia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-emerald-600/10 mix-blend-multiply z-10" />
              {/* Using a placeholder gradient since we don't have a specific image */}
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
                 <span className="text-white text-2xl font-bold opacity-50">DELALA</span>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-emerald-50 rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-50 rounded-full -z-10" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission & Vision</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Our mission is to transform home renting in Ethiopia by delivering transparent property listings, verified landlords, digital lease contracts, and hassle-free move-in services. We envision a future where finding and managing rental homes across Ethiopia is effortless, secure, and accessible to everyone.
            </p>

            <div className="space-y-4">
              {[
                "Verified Residential & Villa Listings",
                "Dedicated 24/7 Tenant & Landlord Support",
                "Instant Digital Leases & Chapa Payments",
                "Efficient Move-In Deep Cleaning & Moving Services"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500 w-6 h-6 flex-shrink-0" />
                  <span className="font-medium text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Showcase Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h6 className="text-blue-700 font-bold uppercase tracking-wider text-sm mb-2">What We Do</h6>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Our Core Business Areas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Residential & Luxury Apartments",
                image: "/images/residential_apartments.png",
                href: "/marketplace",
              },
              {
                title: "Villas, Family Homes & Properties",
                image: "/images/villas_family_homes.png",
                href: "/marketplace",
              },
              {
                title: "Move-In Cleaning & Inspection Services",
                image: "/images/move_in_services.png",
                href: "/services",
              },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 no-underline"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex items-center justify-between p-5 bg-slate-100 border-t border-slate-200">
                  <h5 className="font-bold text-slate-800 text-sm md:text-base truncate pr-4">{item.title}</h5>
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white flex-shrink-0 group-hover:bg-blue-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-slate-900 rounded-3xl p-12 text-white text-center">
          <div>
            <p className="text-4xl font-black text-emerald-400 mb-2">10+</p>
            <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">Years Experience</p>
          </div>
          <div>
            <p className="text-4xl font-black text-emerald-400 mb-2">500+</p>
            <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">Happy Clients</p>
          </div>
          <div>
            <p className="text-4xl font-black text-emerald-400 mb-2">50+</p>
            <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">Products</p>
          </div>
          <div>
            <p className="text-4xl font-black text-emerald-400 mb-2">24/7</p>
            <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">Support</p>
          </div>
        </div>

      </div>
    </div>
  );
}
