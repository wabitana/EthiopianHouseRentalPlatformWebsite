'use client';

import { useEffect, useState } from 'react';
import { subscriptionService } from '@/services/subscription.service';

export default function OwnerSubscriptionPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => { fetchSubscriptionInfo(); }, []);

  async function fetchSubscriptionInfo() {
    try {
      const plansRes = await subscriptionService.getPlans();
      if (plansRes.success) setPlans(plansRes.data.plans || []);
      
      const subRes = await subscriptionService.getMySubscription();
      if (subRes.success) setCurrentSub(subRes.data.subscription);
    } catch { 
      // fallback mock plans if backend doesn't have any seeded yet
      setPlans([
        { id: 'basic', name: 'Basic Plan', price: 100, durationDays: 30, maxListings: 3, features: ['List up to 3 properties', 'Standard visibility', 'Email notifications'] },
        { id: 'standard', name: 'Standard Plan', price: 300, durationDays: 30, maxListings: 10, features: ['List up to 10 properties', 'Karta Document badge', 'Priority search sorting'] },
        { id: 'premium', name: 'Premium Plan', price: 500, durationDays: 30, maxListings: 100, features: ['List up to 100 properties', 'Karta Document verification priority', 'Promoted property badges'] },
      ]);
    } finally { setLoading(false); }
  }

  async function handleSubscribe(planId: string) {
    setSubscribing(planId);
    try {
      const res = await subscriptionService.subscribe(planId);
      if (res.success) {
        alert('Simulation: Payment initialized via Chapa and completed successfully!');
        fetchSubscriptionInfo();
      }
    } catch (err: any) {
      alert(err.error?.message || 'Failed to subscribe.');
    } finally {
      setSubscribing(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Owner Subscription Panel</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">An active subscription plan is required to publish property listings on Delala.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>
        ) : (
          <div className="space-y-8">
            {/* Current Active Plan */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Your Active Plan Status</h2>
              {currentSub ? (
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Plan Name</p>
                    <p className="text-lg font-extrabold text-slate-850 dark:text-slate-200">{currentSub.plan?.name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Listings Limit</p>
                    <p className="text-lg font-extrabold text-slate-850 dark:text-slate-200">Max {currentSub.plan?.maxListings} Listings</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Expires On</p>
                    <p className="text-lg font-extrabold text-slate-850 dark:text-slate-200">{new Date(currentSub.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">You do not have an active subscription yet. Purchase a plan below to start listing.</p>
              )}
            </div>

            {/* List Plans */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">Select a Listing Plan</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((p) => (
                  <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">{p.name}</h3>
                        <p className="text-3xl font-black text-emerald-600 mt-2">{p.price} <span className="text-xs text-slate-400">ETB/mo</span></p>
                      </div>
                      <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {p.features?.map((f: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-emerald-500">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSubscribe(p.id)}
                      disabled={subscribing === p.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                    >
                      {subscribing === p.id ? 'Processing...' : 'Subscribe via Chapa'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
