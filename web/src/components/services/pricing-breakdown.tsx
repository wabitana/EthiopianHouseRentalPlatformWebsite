"use client";

import { formatCurrency } from "@/lib/utils";

interface Item {
  label: string;
  amount: number;
}

interface Props {
  items: Item[];
  total: number;
  discount?: number;
}

export function PricingBreakdown({ items, total, discount }: Props) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
      <p className="mb-3 text-sm font-medium text-emerald-800">Price Breakdown</p>
      <div className="space-y-1.5 text-sm">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-slate-600">
            <span>{item.label}</span>
            <span className={item.amount < 0 ? "text-emerald-600" : ""}>
              {item.amount < 0 ? "−" : ""}
              {formatCurrency(Math.abs(item.amount))}
            </span>
          </div>
        ))}
        {discount ? (
          <div className="flex justify-between text-emerald-600">
            <span>Subscription savings</span>
            <span>−{formatCurrency(discount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-emerald-200 pt-2 font-bold text-emerald-900">
          <span>Estimated Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
