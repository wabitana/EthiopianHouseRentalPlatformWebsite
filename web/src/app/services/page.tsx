import Link from "next/link";

import { Sparkles, Bug, Truck, Calculator, Package, Repeat, Star, PaintRoller, FlaskConical, Sofa, HardHat, Box, Check, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { SERVICE_LABELS, SERVICE_DESCRIPTIONS } from "@/lib/pricing";

import { prisma } from "@/lib/prisma";

import { StarRating } from "@/components/services/star-rating";



const serviceIcons = {

  CLEANING: Sparkles,

  PEST_CONTROL: Bug,

  MOVING: Truck,

};



export default async function ServicesPage() {
  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: { serviceBookingId: { not: null } },
      include: { user: { select: { name: true } }, serviceBooking: { select: { type: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch (error) {
    console.warn("Failed to fetch reviews from database:", error);
  }



  const avgRating =

    reviews.length > 0

      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

      : 4.8;



  const services = (["CLEANING", "PEST_CONTROL", "MOVING"] as const).map((type) => ({

    type,

    label: SERVICE_LABELS[type],

    description: SERVICE_DESCRIPTIONS[type],

    icon: serviceIcons[type],

  }));



  return (

    <div className="bg-slate-50 pb-16">
      {/* New Service Section from 2016 */}
      <div className="w-full py-16 px-4 lg:px-0 bg-white mb-12">
        <div className="flex flex-col lg:flex-row m-0 max-w-[1600px] mx-auto">
          <div className="hidden lg:flex lg:w-1/4 relative">
            <div className="flex items-center justify-center bg-emerald-600 w-full min-h-[400px] rounded-r-[3rem] overflow-hidden relative shadow-xl">
              <h1 className="text-4xl lg:text-6xl font-black text-white m-0 whitespace-nowrap absolute" style={{ transform: 'rotate(-90deg)' }}>
                In Service since 2016
              </h1>
            </div>
          </div>

          <div className="w-full lg:w-3/4 lg:pl-16 lg:pr-6">
            <div className="text-center lg:text-left mb-12">
              <h6 className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-2">Our Services</h6>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900">Explore Our Services</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Item 1 */}
              <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center border-[6px] border-white rounded-2xl bg-emerald-100 mb-6 shadow-sm" style={{ width: 80, height: 80 }}>
                  <Sparkles className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-slate-900">Move-In Deep Cleaning</h4>
                <p className="text-sm text-slate-600 mb-6 h-32 overflow-hidden leading-relaxed">
                  <b className="text-slate-800">Deep Clean:</b> Thorough scrubbing, sanitization, and carpet wash before moving into your new home.<br /><br />
                  <b className="text-slate-800">Post-Lease Clean:</b> Professional end-of-tenancy deep cleaning to ensure full security deposit refund.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Eco-Friendly Sanitizers</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Verified Cleaning Staff</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />100% Satisfaction Guarantee</p>
                </div>
                <Link href="/services/book?type=CLEANING" className="flex items-center justify-center w-full bg-white border-2 border-emerald-100 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                  Book Cleaning <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Item 2 */}
              <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center border-[6px] border-white rounded-2xl bg-emerald-100 mb-6 shadow-sm" style={{ width: 80, height: 80 }}>
                  <HardHat className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-slate-900">Pre-Rental Inspection</h4>
                <p className="text-sm text-slate-600 mb-6 h-32 overflow-hidden leading-relaxed">
                  <b className="text-slate-800">50-Point Audit:</b> Detailed structural, electrical, and plumbing walkthrough reports.<br /><br />
                  <b className="text-slate-800">Digital Report:</b> Instant PDF inspection certificate attached to your Chapa digital lease.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Certified Home Inspectors</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Prevent Hidden Move-In Costs</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Same-Day Digital Delivery</p>
                </div>
                <Link href="/services/book?type=PEST_CONTROL" className="flex items-center justify-center w-full bg-white border-2 border-emerald-100 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                  Schedule Inspection <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Item 3 */}
              <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center border-[6px] border-white rounded-2xl bg-emerald-100 mb-6 shadow-sm" style={{ width: 80, height: 80 }}>
                  <Truck className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-slate-900">Tenant Relocation & Moving</h4>
                <p className="text-sm text-slate-600 mb-6 h-32 overflow-hidden leading-relaxed">
                  <b className="text-slate-800">Hassle-Free Move:</b> Covered transport trucks, heavy furniture loading, and protective packing.<br /><br />
                  <b className="text-slate-800">Door-to-Door:</b> Reliable transport across Addis Ababa and key regional Ethiopian cities.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Insured Luggage Transport</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />GPS Truck Live Tracking</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Experienced Movers</p>
                </div>
                <Link href="/services/book?type=MOVING" className="flex items-center justify-center w-full bg-white border-2 border-emerald-100 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                  Book Moving Truck <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Item 4 */}
              <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center border-[6px] border-white rounded-2xl bg-emerald-100 mb-6 shadow-sm" style={{ width: 80, height: 80 }}>
                  <Box className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-slate-900">Locksmith & Key Security</h4>
                <p className="text-sm text-slate-600 mb-6 h-32 overflow-hidden leading-relaxed">
                  <b className="text-slate-800">Lock Replacement:</b> Change cylinder locks and rekey doors immediately after lease signing.<br /><br />
                  <b className="text-slate-800">Smart Locks:</b> Upgrade to digital keypad or fingerprint door locks for premium safety.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />24/7 Locksmith Support</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Verified Hardware</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Rapid On-Site Arrival</p>
                </div>
                <Link href="/services/book?type=PEST_CONTROL" className="flex items-center justify-center w-full bg-white border-2 border-emerald-100 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                  Request Locksmith <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Item 5 */}
              <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center border-[6px] border-white rounded-2xl bg-emerald-100 mb-6 shadow-sm" style={{ width: 80, height: 80 }}>
                  <Bug className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-slate-900">Sanitization & Pest Control</h4>
                <p className="text-sm text-slate-600 mb-6 h-32 overflow-hidden leading-relaxed">
                  <b className="text-slate-800">Pest Eradication:</b> Odorless treatments for residential apartments, villas, and compound yards.<br /><br />
                  <b className="text-slate-800">Sanitization:</b> Disinfection treatments before tenant occupancy.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Odorless & Safe Formula</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Long-Term Protection</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Certified Technicians</p>
                </div>
                <Link href="/services/book?type=PEST_CONTROL" className="flex items-center justify-center w-full bg-white border-2 border-emerald-100 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                  Book Pest Control <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Item 6 */}
              <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center border-[6px] border-white rounded-2xl bg-emerald-100 mb-6 shadow-sm" style={{ width: 80, height: 80 }}>
                  <Sofa className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-slate-900">On-Demand Home Repairs</h4>
                <p className="text-sm text-slate-600 mb-6 h-32 overflow-hidden leading-relaxed">
                  <b className="text-slate-800">Plumbing & Electrical:</b> Fast emergency fixes for water leaks, power breakers, and wiring issues.<br /><br />
                  <b className="text-slate-800">Handyman:</b> TV mounting, curtain installation, and wall painting TOUCH-UP.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Vetted Local Handymen</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Upfront ETB Rates</p>
                  <p className="text-slate-700 font-medium text-sm flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-3" />Quality Guarantee</p>
                </div>
                <Link href="/services/book?type=CLEANING" className="flex items-center justify-center w-full bg-white border-2 border-emerald-100 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                  Book Handyman <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="mb-10 text-center">

          <h1 className="text-3xl font-bold text-slate-900">Smart Service System</h1>

          <p className="mx-auto mt-2 max-w-2xl text-slate-600">

            Book cleaning, pest control, and moving services with automated pricing,

            appointment scheduling, provider assignment, and customer reviews.

          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3">

            <Link href="/services/packages">

              <Button variant="outline" size="sm">

                <Package className="mr-2 h-4 w-4" /> View Packages

              </Button>

            </Link>

            <Link href="/services/subscriptions">

              <Button variant="outline" size="sm">

                <Repeat className="mr-2 h-4 w-4" /> Subscriptions

              </Button>

            </Link>

          </div>

        </div>



        <div className="mb-12 grid gap-6 md:grid-cols-3">

          {services.map((service) => (

            <Card key={service.type} className="card-hover">

              <CardContent className="p-6 text-center">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                  <service.icon className="h-8 w-8" />

                </div>

                <h3 className="text-xl font-bold text-slate-900">{service.label}</h3>

                <p className="mt-2 text-sm text-slate-600">{service.description}</p>

                <Link href={`/services/book?type=${service.type}`} className="mt-6 block">

                  <Button className="w-full">Schedule Appointment</Button>

                </Link>

              </CardContent>

            </Card>

          ))}

        </div>



        <div className="mb-12 grid gap-6 md:grid-cols-2">

          <Card className="bg-slate-900 text-white">

            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">

              <Calculator className="h-12 w-12 shrink-0 text-emerald-400" />

              <div className="flex-1">

                <h3 className="text-lg font-bold">Automated Price Estimation</h3>

                <p className="mt-1 text-slate-300 text-sm">

                  Transparent ETB pricing based on property size, rooms, distance,

                  and package tier — with a full line-item breakdown before checkout.

                </p>

              </div>

            </CardContent>

          </Card>



          <Card>

            <CardContent className="p-8">

              <div className="flex items-center gap-3">

                <Star className="h-8 w-8 text-amber-400" />

                <div>

                  <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>

                  <StarRating value={Math.round(avgRating)} size="sm" />

                  <p className="text-sm text-slate-500">Customer satisfaction</p>

                </div>

              </div>

              {reviews.length > 0 && (

                <div className="mt-4 space-y-3 border-t pt-4">

                  {reviews.map((r) => (

                    <div key={r.id} className="text-sm">

                      <div className="flex items-center gap-2">

                        <StarRating value={r.rating} size="sm" />

                        <span className="font-medium">{r.user.name}</span>

                      </div>

                      {r.comment && (

                        <p className="mt-1 text-slate-600 line-clamp-2">{r.comment}</p>

                      )}

                    </div>

                  ))}

                </div>

              )}

            </CardContent>

          </Card>
        </div>
      </div>
    </div>
  );
}
