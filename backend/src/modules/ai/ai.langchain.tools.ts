import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { executeAiTool, ToolContext } from './ai.tools';
import { isToolAllowed } from './ai.permissions';

export interface ToolExecutionCollector {
  properties: Map<string, any>;
  actions: string[];
}

export function createLangChainTools(context: ToolContext, collector: ToolExecutionCollector) {
  const handleToolExecution = async (name: string, args: any) => {
    if (!isToolAllowed(name, context)) {
      return JSON.stringify({ error: `Permission denied for tool ${name}. User authentication or role required.` });
    }

    const toolResult = await executeAiTool(name, args, context);

    // Collect properties for Flutter UI cards
    if (toolResult.properties && Array.isArray(toolResult.properties)) {
      for (const p of toolResult.properties) {
        collector.properties.set(p.id, p);
      }
    } else if (toolResult.property) {
      collector.properties.set(toolResult.property.id, toolResult.property);
    } else if (toolResult.recommendations && Array.isArray(toolResult.recommendations)) {
      for (const r of toolResult.recommendations) {
        if (r.property) collector.properties.set(r.property.id, r.property);
      }
    }

    collector.actions.push(`Executed tool: ${name}`);
    return JSON.stringify(toolResult);
  };

  return [
    tool(
      async (args) => handleToolExecution('search_properties', args),
      {
        name: 'search_properties',
        description: 'Search REAL active house listings from the platform database with filters.',
        schema: z.object({
          city: z.string().optional().describe('City name (e.g. Addis Ababa, Mekelle, Hawassa, Adama, Bahir Dar)'),
          area: z.string().optional().describe('Subcity or district (e.g. Bole, Kazanchis, Sarbet, CMC, Ayat, Summit)'),
          neighborhood: z.string().optional().describe('Specific area or neighborhood'),
          propertyType: z.string().optional().describe('Type of property: Apartment, Villa, Studio, Condominium, Townhouse'),
          minPrice: z.number().optional().describe('Minimum monthly rent in ETB'),
          maxPrice: z.number().optional().describe('Maximum monthly rent in ETB'),
          bedrooms: z.number().optional().describe('Minimum number of bedrooms'),
          bathrooms: z.number().optional().describe('Minimum number of bathrooms'),
          amenities: z.array(z.string()).optional().describe('Required amenities list'),
          availability: z.boolean().optional().describe('Must be currently available'),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('get_property_details', args),
      {
        name: 'get_property_details',
        description: 'Get full details for a specific REAL property ID from the database.',
        schema: z.object({
          propertyId: z.string().describe('Real Property ID'),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('recommend_properties', args),
      {
        name: 'recommend_properties',
        description: 'Rank and recommend real published properties matching user requirements.',
        schema: z.object({
          city: z.string().optional(),
          area: z.string().optional(),
          maxPrice: z.number().optional(),
          bedrooms: z.number().optional(),
          preferredAmenities: z.array(z.string()).optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('compare_properties', args),
      {
        name: 'compare_properties',
        description: 'Compare 2 to 3 real properties side-by-side using database records.',
        schema: z.object({
          propertyIds: z.array(z.string()).describe('List of real Property IDs'),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('similar_properties', args),
      {
        name: 'similar_properties',
        description: 'Find real database properties similar to a target property ID.',
        schema: z.object({
          propertyId: z.string(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('search_by_budget', args),
      {
        name: 'search_by_budget',
        description: 'Find real properties within a price range in ETB.',
        schema: z.object({
          maxPrice: z.number().describe('Maximum monthly budget in ETB'),
          minPrice: z.number().optional(),
          city: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('search_by_location', args),
      {
        name: 'search_by_location',
        description: 'Find real properties in a specific city, subcity, or neighborhood.',
        schema: z.object({
          location: z.string().describe('Location string e.g. Bole, Kazanchis, Addis Ababa'),
          maxPrice: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('search_by_amenities', args),
      {
        name: 'search_by_amenities',
        description: 'Find properties that include requested amenities (e.g. Water Tank, Parking, Security).',
        schema: z.object({
          amenities: z.array(z.string()),
          city: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('search_by_rooms', args),
      {
        name: 'search_by_rooms',
        description: 'Find properties based on bedroom and bathroom count.',
        schema: z.object({
          bedrooms: z.number(),
          bathrooms: z.number().optional(),
          city: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('search_available_now', args),
      {
        name: 'search_available_now',
        description: 'Find properties marked as currently available.',
        schema: z.object({
          city: z.string().optional(),
          maxPrice: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('explain_property', args),
      {
        name: 'explain_property',
        description: 'Explain a property record in simple terms.',
        schema: z.object({
          propertyId: z.string(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('summarize_property', args),
      {
        name: 'summarize_property',
        description: 'Summarize key features of a property.',
        schema: z.object({
          propertyId: z.string(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('explain_match', args),
      {
        name: 'explain_match',
        description: 'Explain why a property matches user search criteria.',
        schema: z.object({
          propertyId: z.string(),
          userCriteria: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('explain_price_factor', args),
      {
        name: 'explain_price_factor',
        description: 'Explain factors influencing a property price.',
        schema: z.object({
          propertyId: z.string(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('generate_amharic_lease_draft', args),
      {
        name: 'generate_amharic_lease_draft',
        description: 'Generate standard Amharic & English rental lease terms draft.',
        schema: z.object({
          tenantName: z.string().optional(),
          landlordName: z.string().optional(),
          monthlyRentETB: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('calculate_commute_time', args),
      {
        name: 'calculate_commute_time',
        description: 'Calculate minibus taxi, light rail, and ride-hail commute times in Addis Ababa.',
        schema: z.object({
          destinationHub: z.string().optional(),
          originArea: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('generate_visit_checklist', args),
      {
        name: 'generate_visit_checklist',
        description: 'Generate a practical physical inspection checklist for visiting rental houses in Ethiopia.',
        schema: z.object({
          propertyType: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('explain_rental_terms', args),
      {
        name: 'explain_rental_terms',
        description: 'Explain standard Ethiopian lease terms (advance rent, security deposit, utility rules).',
        schema: z.object({
          term: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('assess_water_electricity_reliability', args),
      {
        name: 'assess_water_electricity_reliability',
        description: 'Assess water reserve tank and electricity generator backup reliability for a house.',
        schema: z.object({
          propertyId: z.string(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('roommate_matching_calculator', args),
      {
        name: 'roommate_matching_calculator',
        description: 'Calculate bill splitting and shared expenses (rent, water, guard) for roommates in ETB.',
        schema: z.object({
          propertyId: z.string().optional(),
          roommatesCount: z.number().optional(),
          waterTankRefillETB: z.number().optional(),
          securityGuardETB: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('market_price_analyzer', args),
      {
        name: 'market_price_analyzer',
        description: 'Analyze if a property rent is fair market price, bargain deal, or premium rate in its subcity.',
        schema: z.object({
          propertyId: z.string(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('scam_verification_check', args),
      {
        name: 'scam_verification_check',
        description: 'Check platform safety score and identity verification status for a listing.',
        schema: z.object({
          propertyId: z.string(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('ai_listing_copywriter', args),
      {
        name: 'ai_listing_copywriter',
        description: 'Draft attractive bilingual (Amharic & English) property listing copy for house providers.',
        schema: z.object({
          propertyType: z.string().optional(),
          subcity: z.string().optional(),
          bedrooms: z.number().optional(),
          priceETB: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('create_price_alert', args),
      {
        name: 'create_price_alert',
        description: 'Set a notification alert for properties matching budget and area criteria.',
        schema: z.object({
          subcity: z.string(),
          maxPriceETB: z.number(),
          bedrooms: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('energy_water_bill_estimator', args),
      {
        name: 'energy_water_bill_estimator',
        description: 'Estimate expected monthly electricity and water bills in ETB based on occupant count.',
        schema: z.object({
          occupants: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('neighborhood_safety_score_analyzer', args),
      {
        name: 'neighborhood_safety_score_analyzer',
        description: 'Analyze subcity safety score, street lighting index, and security risk levels in Addis Ababa.',
        schema: z.object({
          subcity: z.string().optional().describe('Subcity e.g. Bole, Sarbet, Kazanchis, Piassa, Merkato, CMC'),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('ethiopian_tax_and_withholding_calculator', args),
      {
        name: 'ethiopian_tax_and_withholding_calculator',
        description: 'Calculate Schedule D Ethiopian rental income tax and 5% withholding tax deductions.',
        schema: z.object({
          monthlyRentETB: z.number().describe('Monthly rent in ETB'),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('water_shortage_resilience_advisor', args),
      {
        name: 'water_shortage_resilience_advisor',
        description: 'Check municipal water rotation schedules in Addis Ababa and recommend reserve Rotto tank capacity in Liters.',
        schema: z.object({
          subcity: z.string().optional(),
          occupants: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('solar_backup_inverter_calculator', args),
      {
        name: 'solar_backup_inverter_calculator',
        description: 'Calculate solar panel, inverter, and battery backup requirements to survive load-shedding outages.',
        schema: z.object({
          essentialAppliances: z.array(z.string()).optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('expat_diplomat_relocation_concierge', args),
      {
        name: 'expat_diplomat_relocation_concierge',
        description: 'VIP relocation concierge for expats, diplomats, and NGO workers (proximity to ICS, Sandford, UN ECA, EU).',
        schema: z.object({
          organizationType: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('rental_yield_investment_calculator', args),
      {
        name: 'rental_yield_investment_calculator',
        description: 'Calculate Gross Rental Yield %, payback period, and 5-year capital appreciation for real estate investors.',
        schema: z.object({
          propertyPriceETB: z.number(),
          monthlyRentETB: z.number(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('negotiation_strategy_advisor', args),
      {
        name: 'negotiation_strategy_advisor',
        description: 'Generate tactical rent price negotiation strategies based on seasonal demand and 6/12 month advance lump sums.',
        schema: z.object({
          listedRentETB: z.number(),
          advanceMonths: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('furniture_decor_cost_estimator', args),
      {
        name: 'furniture_decor_cost_estimator',
        description: 'Estimate local Ethiopian furniture and home appliance setup budget in ETB (sofa, beds, water heater).',
        schema: z.object({
          bedrooms: z.number().optional(),
          qualityLevel: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('tenant_landlord_dispute_mediator', args),
      {
        name: 'tenant_landlord_dispute_mediator',
        description: 'Provide legal guidance based on the Ethiopian Civil Code (Articles 2896–2974) for deposit returns & lease disputes.',
        schema: z.object({
          disputeTopic: z.string().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('move_in_moving_truck_estimator', args),
      {
        name: 'move_in_moving_truck_estimator',
        description: 'Estimate ISUZU moving truck hire and helper costs between subcities in Addis Ababa.',
        schema: z.object({
          fromSubcity: z.string(),
          toSubcity: z.string(),
          floorLevel: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('school_proximity_family_planner', args),
      {
        name: 'school_proximity_family_planner',
        description: 'Rank rental neighborhoods by proximity to top international and local schools (ICS, Sandford, Lycée, Gibson).',
        schema: z.object({
          schoolName: z.string().optional(),
          maxCommuteMinutes: z.number().optional(),
        }),
      }
    ),

    tool(
      async (args) => handleToolExecution('commercial_office_retail_space_finder', args),
      {
        name: 'commercial_office_retail_space_finder',
        description: 'Search for commercial ground-floor shopfronts, offices, or G+1 business spaces on main roads.',
        schema: z.object({
          businessType: z.string().optional(),
          maxBudgetETB: z.number().optional(),
        }),
      }
    ),
  ];
}
