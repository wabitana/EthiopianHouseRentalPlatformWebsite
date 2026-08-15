import type { ServiceType } from "@/types";

export interface ServicePricingInput {
  type: ServiceType;
  propertySize?: string;
  rooms?: number;
  distanceKm?: number;
  packageName?: string;
}

const BASE_PRICES: Record<ServiceType, number> = {
  CLEANING: 1500,
  PEST_CONTROL: 2500,
  MOVING: 3000,
};

const SIZE_MULTIPLIERS: Record<string, number> = {
  small: 1,
  medium: 1.5,
  large: 2.2,
  commercial: 3,
};

const ROOM_RATE = 300;
const DISTANCE_RATE = 50;

export function estimateServicePrice(input: ServicePricingInput): number {
  let price = BASE_PRICES[input.type];

  if (input.propertySize) {
    price *= SIZE_MULTIPLIERS[input.propertySize] || 1;
  }

  if (input.rooms && input.type === "CLEANING") {
    price += input.rooms * ROOM_RATE;
  }

  if (input.distanceKm && input.type === "MOVING") {
    price += input.distanceKm * DISTANCE_RATE;
  }

  if (input.packageName === "premium") {
    price *= 1.35;
  } else if (input.packageName === "subscription_monthly") {
    price *= 0.85;
  }

  return Math.round(price);
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  CLEANING: "Cleaning Service",
  PEST_CONTROL: "Pest Control",
  MOVING: "Moving & Logistics",
};

export const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  CLEANING: "Professional home and office cleaning with eco-friendly products.",
  PEST_CONTROL: "Safe and effective pest management for residential and commercial spaces.",
  MOVING: "Reliable residential and commercial relocation across Addis Ababa and beyond.",
};
