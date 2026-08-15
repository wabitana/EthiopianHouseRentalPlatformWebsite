import { ToolContext } from './ai.tools';

const GUEST_ALLOWED_TOOLS = new Set([
  'search_properties',
  'get_property_details',
  'recommend_properties',
  'compare_properties',
  'similar_properties',
  'search_by_budget',
  'search_by_location',
  'search_by_amenities',
  'search_by_rooms',
  'search_available_now',
  'explain_property',
  'summarize_property',
  'explain_match',
  'suggest_search_filters',
  'refine_search',
  'estimate_total_monthly_cost',
  'explain_rental_terms',
  'generate_visit_checklist',
  'generate_negotiation_message',
  'housing_faq',
  'instant_book_tour',
  'generate_amharic_lease_draft',
  'calculate_commute_time',
  'assess_water_electricity_reliability',
  'roommate_matching_calculator',
  'market_price_analyzer',
  'scam_verification_check',
  'ai_listing_copywriter',
  'create_price_alert',
  'energy_water_bill_estimator',
]);

const SEEKER_EXCLUSIVE_TOOLS = new Set([
  'get_favorites',
  'check_favorite',
  'get_user_inquiries',
]);

const PROVIDER_EXCLUSIVE_TOOLS = new Set([
  'get_my_properties',
  'summarize_my_listings',
  'get_property_inquiries',
  'explain_listing_status',
  'listing_improvement_suggestions',
]);

export function isToolAllowed(toolName: string, ctx: ToolContext): boolean {
  // Always allowed for anyone
  if (GUEST_ALLOWED_TOOLS.has(toolName)) {
    return true;
  }

  // Require logged in user
  if (!ctx.userId) {
    return false;
  }

  // Seeker tools
  if (SEEKER_EXCLUSIVE_TOOLS.has(toolName)) {
    return true; // Any authenticated user can check their favorites/inquiries
  }

  // Provider tools
  if (PROVIDER_EXCLUSIVE_TOOLS.has(toolName)) {
    return ctx.userRole === 'provider' || ctx.userRole === 'admin';
  }

  return true;
}
