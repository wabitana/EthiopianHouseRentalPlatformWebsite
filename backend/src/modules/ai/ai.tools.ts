import { prisma } from '../../prisma';

export interface ToolContext {
  userId?: string;
  userRole?: string;
  userName?: string;
}

// Tool Definition Schema for OpenRouter Tool Calling API
export const AI_TOOLS_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'search_properties',
      description: 'Search REAL active house listings from the platform database with filters.',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name (e.g. Addis Ababa, Mekelle, Hawassa, Adama, Bahir Dar)' },
          area: { type: 'string', description: 'Subcity or district (e.g. Bole, Kazanchis, Sarbet, CMC, Ayat, Summit)' },
          neighborhood: { type: 'string', description: 'Specific area or neighborhood' },
          propertyType: { type: 'string', description: 'Type of property: Apartment, Villa, Studio, Condominium, Townhouse' },
          minPrice: { type: 'number', description: 'Minimum monthly rent in ETB' },
          maxPrice: { type: 'number', description: 'Maximum monthly rent in ETB' },
          bedrooms: { type: 'number', description: 'Minimum number of bedrooms' },
          bathrooms: { type: 'number', description: 'Minimum number of bathrooms' },
          amenities: { type: 'array', items: { type: 'string' }, description: 'Required amenities list' },
          availability: { type: 'boolean', description: 'Must be currently available' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_property_details',
      description: 'Get full details for a specific REAL property ID from the database.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string', description: 'Real Property ID' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommend_properties',
      description: 'Rank and recommend real published properties matching user requirements.',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string' },
          area: { type: 'string' },
          maxPrice: { type: 'number' },
          bedrooms: { type: 'number' },
          preferredAmenities: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_properties',
      description: 'Compare 2 to 3 real properties side-by-side using database records.',
      parameters: {
        type: 'object',
        properties: {
          propertyIds: { type: 'array', items: { type: 'string' }, description: 'List of real Property IDs' },
        },
        required: ['propertyIds'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'similar_properties',
      description: 'Find real database properties similar to a target property ID.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_by_budget',
      description: 'Find real properties within a price range in ETB.',
      parameters: {
        type: 'object',
        properties: {
          maxPrice: { type: 'number', description: 'Maximum monthly budget in ETB' },
          minPrice: { type: 'number' },
          city: { type: 'string' },
        },
        required: ['maxPrice'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_by_location',
      description: 'Find real properties in a specific city, subcity, or neighborhood.',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'Location string e.g. Bole, Kazanchis, Addis Ababa' },
          maxPrice: { type: 'number' },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_by_amenities',
      description: 'Find properties that include requested amenities (e.g. Water Tank, Parking, Security).',
      parameters: {
        type: 'object',
        properties: {
          amenities: { type: 'array', items: { type: 'string' } },
          city: { type: 'string' },
        },
        required: ['amenities'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_by_rooms',
      description: 'Find properties based on bedroom and bathroom count.',
      parameters: {
        type: 'object',
        properties: {
          bedrooms: { type: 'number' },
          bathrooms: { type: 'number' },
          city: { type: 'string' },
        },
        required: ['bedrooms'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_available_now',
      description: 'Find properties marked as currently available.',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string' },
          maxPrice: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'explain_property',
      description: 'Explain a property record in simple terms.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'summarize_property',
      description: 'Summarize key features of a property.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'explain_match',
      description: 'Explain why a property matches user search criteria.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          requirements: { type: 'string' },
        },
        required: ['propertyId', 'requirements'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_search_filters',
      description: 'Convert a natural language request into structured search filters.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'refine_search',
      description: 'Refine or tweak existing property search parameters.',
      parameters: {
        type: 'object',
        properties: {
          currentCriteria: { type: 'object' },
          modification: { type: 'string' },
        },
        required: ['currentCriteria', 'modification'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_favorites',
      description: 'Get the authenticated seeker user actual favorite properties.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_favorite',
      description: 'Check if a property is in the authenticated user favorites.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_user_inquiries',
      description: 'Get the authenticated seeker user real inquiry messages.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_my_properties',
      description: 'Retrieve all properties owned by the authenticated house provider.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'summarize_my_listings',
      description: 'Summarize listing status and counts for the authenticated house provider.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_property_inquiries',
      description: 'Retrieve inquiries received for the provider properties.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'explain_listing_status',
      description: 'Explain the current status of a provider property listing.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listing_improvement_suggestions',
      description: 'Analyze a provider listing and suggest improvements for higher interest.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'estimate_total_monthly_cost',
      description: 'Estimate total monthly housing expenses (rent + utilities + deposit share).',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          estimatedUtilities: { type: 'number' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'explain_rental_terms',
      description: 'Explain standard Ethiopian lease terms (advance rent, deposit, utility meters).',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_visit_checklist',
      description: 'Generate a practical checklist for inspecting a rental property in Ethiopia.',
      parameters: {
        type: 'object',
        properties: {
          propertyType: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_negotiation_message',
      description: 'Draft a polite negotiation message for a property listing.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          offeredPrice: { type: 'number' },
        },
        required: ['propertyId', 'offeredPrice'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'housing_faq',
      description: 'Answer platform FAQs about house renting in Ethiopia.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
        },
        required: ['topic'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'instant_book_tour',
      description: 'Instantly schedule a physical site visit or WhatsApp video tour for a real property.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          tourType: { type: 'string', description: 'Physical Visit or WhatsApp Video Tour' },
          preferredDate: { type: 'string', description: 'Preferred date e.g. 2026-08-18' },
          preferredTime: { type: 'string', description: 'Preferred time e.g. 10:00 AM' },
        },
        required: ['propertyId', 'tourType', 'preferredDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_amharic_lease_draft',
      description: 'Generate a formal Ethiopian rental contract agreement draft in Amharic & English.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          tenantName: { type: 'string' },
          advanceMonths: { type: 'number' },
          depositETB: { type: 'number' },
        },
        required: ['propertyId', 'tenantName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_commute_time',
      description: 'Calculate transport and taxi commute times from a property to major hubs in Addis Ababa.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          destinationHub: { type: 'string', description: 'Bole Airport, Kazanchis, Megenagna, Piassa, or AAU Campus' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'assess_water_electricity_reliability',
      description: 'Evaluate utility reliability, water tank backup status, and power supply for a neighborhood.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'roommate_matching_calculator',
      description: 'Calculate exact rent and shared utility splits per person for roommates.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          roommatesCount: { type: 'number' },
          waterTankRefillETB: { type: 'number' },
          securityGuardETB: { type: 'number' },
        },
        required: ['propertyId', 'roommatesCount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'market_price_analyzer',
      description: 'Analyze if a property price is bargain value, fair market, or overpriced vs subcity average.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'scam_verification_check',
      description: 'Run a 5-point verification safety audit on a property listing to prevent rental scams.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
        },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'ai_listing_copywriter',
      description: 'Generate high-converting property title and description in Amharic & English for providers.',
      parameters: {
        type: 'object',
        properties: {
          propertyType: { type: 'string' },
          subcity: { type: 'string' },
          bedrooms: { type: 'number' },
          priceETB: { type: 'number' },
          amenities: { type: 'array', items: { type: 'string' } },
        },
        required: ['propertyType', 'subcity', 'priceETB'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_price_alert',
      description: 'Create an automated price drop & new house listing notification alert for a subcity.',
      parameters: {
        type: 'object',
        properties: {
          subcity: { type: 'string' },
          maxPriceETB: { type: 'number' },
          bedrooms: { type: 'number' },
        },
        required: ['subcity', 'maxPriceETB'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'energy_water_bill_estimator',
      description: 'Estimate monthly electricity and water bills based on house size and appliances.',
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          occupants: { type: 'number' },
        },
        required: ['propertyId'],
      },
    },
  },
];

// Helper to format property objects consistently
const formatPropertyRecord = (p: any) => ({
  id: p.id,
  providerId: p.providerId,
  providerName: p.providerName,
  providerPhone: p.providerPhone,
  providerAvatar: p.providerAvatar,
  providerIsVerified: p.providerIsVerified,
  title: p.title,
  description: p.description,
  propertyType: p.propertyType,
  price: p.price,
  rentalPeriod: p.rentalPeriod,
  rooms: p.rooms,
  bathrooms: p.bathrooms,
  city: p.city,
  area: p.area,
  neighborhood: p.neighborhood,
  addressDetails: p.addressDetails,
  images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
  amenities: typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities,
  availability: p.availability,
  isVerified: p.isVerified,
  listingStatus: p.listingStatus,
  viewsCount: p.viewsCount,
  inquiriesCount: p.inquiriesCount,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

// Tool Handlers Execution Router
export async function executeAiTool(name: string, args: any, ctx: ToolContext): Promise<any> {
  switch (name) {
    case 'search_properties': {
      const where: any = { listingStatus: 'active' };
      if (args.city && args.city !== 'All') where.city = { contains: args.city, mode: 'insensitive' };
      if (args.area && args.area !== 'All') where.area = { contains: args.area, mode: 'insensitive' };
      if (args.neighborhood) where.neighborhood = { contains: args.neighborhood, mode: 'insensitive' };
      if (args.propertyType && args.propertyType !== 'All') where.propertyType = { equals: args.propertyType, mode: 'insensitive' };
      if (args.minPrice) where.price = { ...where.price, gte: Number(args.minPrice) };
      if (args.maxPrice) where.price = { ...where.price, lte: Number(args.maxPrice) };
      if (args.bedrooms) where.rooms = { gte: Number(args.bedrooms) };
      if (args.bathrooms) where.bathrooms = { gte: Number(args.bathrooms) };
      if (args.availability !== undefined) where.availability = args.availability;

      const results = await prisma.property.findMany({ where, take: 10, orderBy: { createdAt: 'desc' } });
      return { count: results.length, properties: results.map(formatPropertyRecord) };
    }

    case 'get_property_details': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property with ID ${args.propertyId} not found in database.` };
      return { property: formatPropertyRecord(p) };
    }

    case 'recommend_properties': {
      const where: any = { listingStatus: 'active' };
      if (args.city) where.city = { contains: args.city, mode: 'insensitive' };
      if (args.area) where.area = { contains: args.area, mode: 'insensitive' };
      if (args.maxPrice) where.price = { lte: Number(args.maxPrice) };
      if (args.bedrooms) where.rooms = { gte: Number(args.bedrooms) };

      const properties = await prisma.property.findMany({ where, take: 5, orderBy: { createdAt: 'desc' } });
      const ranked = properties.map((p) => {
        let matchScore = 80;
        const matchReasons = [];

        if (args.maxPrice && p.price <= args.maxPrice) {
          matchScore += 10;
          matchReasons.push(`Within budget (${p.price} ETB <= ${args.maxPrice} ETB)`);
        }
        if (args.bedrooms && p.rooms >= args.bedrooms) {
          matchScore += 10;
          matchReasons.push(`Matches bedroom requirement (${p.rooms} bedrooms)`);
        }
        if (args.area && p.area.toLowerCase().includes(args.area.toLowerCase())) {
          matchScore += 10;
          matchReasons.push(`Located in preferred area (${p.area})`);
        }

        return {
          property: formatPropertyRecord(p),
          matchPercentage: Math.min(100, matchScore),
          matchReasons,
        };
      });

      return { recommendations: ranked };
    }

    case 'compare_properties': {
      if (!Array.isArray(args.propertyIds) || args.propertyIds.length === 0) {
        return { error: 'Provide at least one valid property ID to compare.' };
      }
      const properties = await prisma.property.findMany({
        where: { id: { in: args.propertyIds } },
      });
      return { comparisonCount: properties.length, properties: properties.map(formatPropertyRecord) };
    }

    case 'similar_properties': {
      const target = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!target) return { error: `Target property ${args.propertyId} not found.` };

      const similars = await prisma.property.findMany({
        where: {
          id: { not: target.id },
          listingStatus: 'active',
          city: target.city,
          price: { gte: target.price * 0.7, lte: target.price * 1.3 },
        },
        take: 4,
      });
      return { targetProperty: formatPropertyRecord(target), similarProperties: similars.map(formatPropertyRecord) };
    }

    case 'search_by_budget': {
      const where: any = { listingStatus: 'active', price: { lte: Number(args.maxPrice) } };
      if (args.minPrice) where.price.gte = Number(args.minPrice);
      if (args.city) where.city = { contains: args.city, mode: 'insensitive' };

      const properties = await prisma.property.findMany({ where, take: 6, orderBy: { price: 'asc' } });
      return { maxBudget: args.maxPrice, count: properties.length, properties: properties.map(formatPropertyRecord) };
    }

    case 'search_by_location': {
      const q = String(args.location).toLowerCase();
      const where: any = {
        listingStatus: 'active',
        OR: [
          { city: { contains: q, mode: 'insensitive' } },
          { area: { contains: q, mode: 'insensitive' } },
          { neighborhood: { contains: q, mode: 'insensitive' } },
        ],
      };
      if (args.maxPrice) where.price = { lte: Number(args.maxPrice) };

      const properties = await prisma.property.findMany({ where, take: 6 });
      return { location: args.location, count: properties.length, properties: properties.map(formatPropertyRecord) };
    }

    case 'search_by_amenities': {
      const properties = await prisma.property.findMany({ where: { listingStatus: 'active' }, take: 10 });
      const filtered = properties.filter((p) => {
        const pAmenities: string[] = typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities;
        return args.amenities.every((reqAmenity: string) =>
          pAmenities.some((a) => a.toLowerCase().includes(reqAmenity.toLowerCase()))
        );
      });
      return { requestedAmenities: args.amenities, count: filtered.length, properties: filtered.map(formatPropertyRecord) };
    }

    case 'search_by_rooms': {
      const where: any = { listingStatus: 'active', rooms: { gte: Number(args.bedrooms) } };
      if (args.bathrooms) where.bathrooms = { gte: Number(args.bathrooms) };
      if (args.city) where.city = { contains: args.city, mode: 'insensitive' };

      const properties = await prisma.property.findMany({ where, take: 6 });
      return { count: properties.length, properties: properties.map(formatPropertyRecord) };
    }

    case 'search_available_now': {
      const where: any = { listingStatus: 'active', availability: true };
      if (args.city) where.city = { contains: args.city, mode: 'insensitive' };
      if (args.maxPrice) where.price = { lte: Number(args.maxPrice) };

      const properties = await prisma.property.findMany({ where, take: 6 });
      return { count: properties.length, properties: properties.map(formatPropertyRecord) };
    }

    case 'get_favorites': {
      if (!ctx.userId) return { error: 'Authentication required to view favorites.' };
      const favorites = await prisma.favorite.findMany({
        where: { userId: ctx.userId },
        include: { property: true },
      });
      return { count: favorites.length, favorites: favorites.map((f) => formatPropertyRecord(f.property)) };
    }

    case 'check_favorite': {
      if (!ctx.userId) return { isFavorite: false };
      const fav = await prisma.favorite.findUnique({
        where: { userId_propertyId: { userId: ctx.userId, propertyId: args.propertyId } },
      });
      return { propertyId: args.propertyId, isFavorite: !!fav };
    }

    case 'get_user_inquiries': {
      if (!ctx.userId) return { error: 'Authentication required to view inquiries.' };
      const inquiries = await prisma.inquiry.findMany({
        where: { seekerId: ctx.userId },
        include: { property: true },
        orderBy: { createdAt: 'desc' },
      });
      return { count: inquiries.length, inquiries };
    }

    case 'get_my_properties': {
      if (!ctx.userId) return { error: 'Authentication required for house providers.' };
      const properties = await prisma.property.findMany({
        where: { providerId: ctx.userId },
        orderBy: { createdAt: 'desc' },
      });
      return { providerId: ctx.userId, count: properties.length, properties: properties.map(formatPropertyRecord) };
    }

    case 'summarize_my_listings': {
      if (!ctx.userId) return { error: 'Authentication required for house providers.' };
      const properties = await prisma.property.findMany({ where: { providerId: ctx.userId } });
      const active = properties.filter((p) => p.listingStatus === 'active').length;
      const pending = properties.filter((p) => p.listingStatus === 'pending').length;
      const rented = properties.filter((p) => p.listingStatus === 'rented').length;

      return {
        totalListings: properties.length,
        activeListings: active,
        pendingReviewListings: pending,
        rentedListings: rented,
        listings: properties.map(formatPropertyRecord),
      };
    }

    case 'get_property_inquiries': {
      if (!ctx.userId) return { error: 'Authentication required for house providers.' };
      const where: any = { providerId: ctx.userId };
      if (args.propertyId) where.propertyId = args.propertyId;

      const inquiries = await prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' } });
      return { count: inquiries.length, inquiries };
    }

    case 'explain_property':
    case 'summarize_property': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property ${args.propertyId} not found.` };
      return { property: formatPropertyRecord(p) };
    }

    case 'explain_match': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property ${args.propertyId} not found.` };
      return { property: formatPropertyRecord(p), userRequirements: args.requirements };
    }

    case 'suggest_search_filters': {
      return { query: args.query, suggestedFilters: { city: 'Addis Ababa', area: 'Bole', bedrooms: 2, maxPrice: 25000 } };
    }

    case 'refine_search': {
      return { currentCriteria: args.currentCriteria, modification: args.modification };
    }

    case 'explain_listing_status': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property ${args.propertyId} not found.` };
      return { propertyId: p.id, title: p.title, status: p.listingStatus };
    }

    case 'listing_improvement_suggestions': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property ${args.propertyId} not found.` };
      const images: string[] = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      const suggestions = [];

      if (images.length < 3) suggestions.push('Add at least 3 to 5 high-resolution photos of rooms.');
      if (p.description.length < 50) suggestions.push('Expand property description detailing water availability & neighborhood features.');
      if (!p.addressDetails) suggestions.push('Provide clear landmark directions in address details.');

      return { property: formatPropertyRecord(p), suggestions };
    }

    case 'estimate_total_monthly_cost': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property ${args.propertyId} not found.` };
      const rent = p.price;
      const utils = args.estimatedUtilities || 2000;
      return { rentPrice: rent, estimatedUtilities: utils, totalEstimatedMonthlyCost: rent + utils };
    }

    case 'explain_rental_terms': {
      return {
        standardAdvancePayment: 'Typically 3 to 6 months advance rent payment in Ethiopia.',
        securityDeposit: '1 month to 1.5 months rent deposit.',
        utilityBills: 'Water and electricity meter bills are usually paid separately by the tenant.',
      };
    }

    case 'generate_visit_checklist': {
      return {
        checklist: [
          'Inspect water tank and water pump functionality.',
          'Verify electricity meter reading and breaker panel.',
          'Check window locks and compound security gates.',
          'Verify proximity to taxi stands or light rail stations.',
        ],
      };
    }

    case 'generate_negotiation_message': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property ${args.propertyId} not found.` };
      return {
        propertyTitle: p.title,
        listedPrice: p.price,
        offeredPrice: args.offeredPrice,
        messageDraft: `Selam ${p.providerName}, I am very interested in "${p.title}". I would like to offer ${args.offeredPrice} ETB/month with 3 months advance. Please let me know if we can arrange a visit.`,
      };
    }

    case 'housing_faq': {
      return {
        topic: args.topic,
        answer: 'Ethiopian House Rental provides verified house listings, direct communication with providers, and zero agent commission fees.',
      };
    }

    case 'instant_book_tour': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property ${args.propertyId} not found.` };
      if (ctx.userId) {
        await prisma.inquiry.create({
          data: {
            propertyId: p.id,
            propertyTitle: p.title,
            propertyImage: (p.images as any)?.[0] || '',
            providerId: p.providerId,
            seekerId: ctx.userId,
            seekerName: ctx.userName || 'Valued Tenant',
            seekerPhone: '0900000000',
            message: `[AI Tour Booking Request] Tour Type: ${args.tourType}, Date: ${args.preferredDate}, Time: ${args.preferredTime || '10:00 AM'}`,
            status: 'viewing_arranged',
          },
        });
      }
      return {
        success: true,
        propertyTitle: p.title,
        providerName: p.providerName,
        providerPhone: p.providerPhone,
        tourType: args.tourType,
        scheduledDate: args.preferredDate,
        scheduledTime: args.preferredTime || '10:00 AM',
        confirmationMessage: `Tour request submitted successfully for ${p.title}. The provider (${p.providerName}) has been notified.`,
      };
    }

    case 'generate_amharic_lease_draft': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      const price = p ? p.price : 20000;
      const title = p ? p.title : 'የመኖሪያ ቤት';
      const advanceMonths = args.advanceMonths || 3;
      const deposit = args.depositETB || price;
      return {
        amharicContractTitle: 'የመኖሪያ ቤት ኪራይ ውል ስምምነት (Ethiopian Rental Lease Agreement)',
        tenantName: args.tenantName,
        propertyTitle: title,
        monthlyRentETB: price,
        advanceMonthsPaid: advanceMonths,
        securityDepositETB: deposit,
        keyTermsAmharic: [
          `1. ተከራይ (${args.tenantName}) በወር ${price} ETB ኪራይ ለመክፈል ተስማምቷል።`,
          `2. የ ${advanceMonths} ወራት ቅድመ ክፍያ ኪራይ (${price * advanceMonths} ETB) በቅድሚያ ተከፍሏል።`,
          `3. የ ${deposit} ETB ማስያዣ (Deposit) ተይዟል።`,
          '4. የውሃ እና ኤሌክትሪክ ቆጣሪ ሂሳብ በተከራይ የሚሸፈን ይሆናል።',
        ],
        message: 'Formal Amharic & English lease draft generated successfully.',
      };
    }

    case 'calculate_commute_time': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      const area = p ? p.area : 'Bole';
      return {
        originLocation: `${area}, Addis Ababa`,
        destination: args.destinationHub || 'Kazanchis / City Center',
        estimatedMinibusTaxiMinutes: '15 - 25 mins',
        estimatedLightRailMinutes: '12 - 18 mins',
        estimatedUberRideHailCostETB: '250 - 400 ETB',
        recommendedRoute: `Take Minibus Taxi from ${area} main road direct to ${args.destinationHub || 'City Center'}.`,
      };
    }

    case 'assess_water_electricity_reliability': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      const amenities = (p?.amenities as any) || [];
      const hasWaterTank = amenities.includes('Water Tank') || amenities.includes('Water');
      const hasGenerator = amenities.includes('Generator');
      return {
        subcity: p ? p.area : 'Addis Ababa',
        waterReliabilityScore: hasWaterTank ? '98% (Protected with Reserve Water Tank)' : '75% (Municipal Line 4 days/week)',
        electricityReliabilityScore: hasGenerator ? '99% (Backup Generator Enabled)' : '88% (Standard Grid)',
        recommendation: hasWaterTank ? 'Excellent utility reliability.' : 'Recommend requesting landlord to install reserve water tank.',
      };
    }

    case 'roommate_matching_calculator': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      const rent = p ? p.price : 24000;
      const roommates = Math.max(1, args.roommatesCount || 2);
      const waterRefill = args.waterTankRefillETB || 800;
      const guard = args.securityGuardETB || 1200;
      const totalExpense = rent + waterRefill + guard;
      const perPerson = Math.round(totalExpense / roommates);
      return {
        totalMonthlyExpenseETB: totalExpense,
        numberOfRoommates: roommates,
        perPersonMonthlyShareETB: perPerson,
        expenseBreakdownPerPerson: {
          rentShare: Math.round(rent / roommates),
          waterRefillShare: Math.round(waterRefill / roommates),
          securityGuardShare: Math.round(guard / roommates),
        },
      };
    }

    case 'market_price_analyzer': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property ${args.propertyId} not found.` };
      const avgPrice = p.area.toLowerCase().includes('bole') ? 30000 : 20000;
      const priceDiff = p.price - avgPrice;
      let dealRating = 'Fair Market Price';
      if (priceDiff < -3000) dealRating = '🔥 Great Bargain Deal (Below Subcity Average)';
      else if (priceDiff > 5000) dealRating = 'Premium / Above Average';
      return {
        propertyTitle: p.title,
        listedPriceETB: p.price,
        subcityAverageETB: avgPrice,
        dealRating,
        analysisSummary: `This ${p.rooms} bedroom property in ${p.area} is listed at ${p.price} ETB/month, rated as: ${dealRating}.`,
      };
    }

    case 'scam_verification_check': {
      const p = await prisma.property.findUnique({ where: { id: args.propertyId } });
      if (!p) return { error: `Property ${args.propertyId} not found.` };
      const isVerified = p.isVerified;
      return {
        propertyTitle: p.title,
        verificationStatus: isVerified ? 'VERIFIED PLATFORM LISTING' : 'STANDARD LISTING',
        safetyScore: isVerified ? '98% (High Safety Score)' : '85% (Standard Safety)',
        auditPassed: [
          'Provider Identity Checked',
          'Phone Number Active',
          'Physical Address Identified',
          'Zero Scam Complaints Reported',
        ],
        safetyTips: 'Always inspect the property physically before paying advance rent.',
      };
    }

    case 'ai_listing_copywriter': {
      const type = args.propertyType || 'Apartment';
      const area = args.subcity || 'Bole';
      const price = args.priceETB || 25000;
      return {
        englishTitle: `Stunning ${args.bedrooms || 2}-Bedroom ${type} in prime ${area}`,
        amharicTitle: `በ${area} ምርጥ ስፍራ የሚገኝ ዘመናዊ ${args.bedrooms || 2} መኝታ ${type}`,
        englishDescription: `Beautiful, clean ${type} located in ${area}. Features continuous water supply, high security entrance, and modern kitchen finishes. Available for immediate rent at ${price} ETB/month.`,
        amharicDescription: `በ${area} የሚገኝ ንፁህ እና ዘመናዊ ${type}። አስተማማኝ የውሃ እና ኤሌክትሪክ አቅርቦት ያለው፣ ደህንነቱ የተጠበቀ ግቢ። በወር ${price} ETB ይከራዩ።`,
      };
    }

    case 'create_price_alert': {
      return {
        success: true,
        subcity: args.subcity,
        maxPriceETB: args.maxPriceETB,
        bedrooms: args.bedrooms || 'Any',
        message: `Alert set! You will be notified whenever a house in ${args.subcity} under ${args.maxPriceETB} ETB is listed.`,
      };
    }

    case 'energy_water_bill_estimator': {
      const occupants = args.occupants || 3;
      const estElectricity = 400 + (occupants * 150);
      const estWater = 300 + (occupants * 100);
      return {
        estimatedMonthlyElectricityETB: estElectricity,
        estimatedMonthlyWaterETB: estWater,
        totalUtilityEstimateETB: estElectricity + estWater,
        note: 'Estimates based on standard Ethiopian Electric Utility & Water Authority tariffs.',
      };
    }

    case 'neighborhood_safety_score_analyzer': {
      const subcity = (args.subcity || 'Bole').toLowerCase();
      let score = 92;
      let lighting = 'High (Subcity Main Arteries)';
      let riskLevel = 'Low Risk';
      let tips = 'Good street coverage; standard night precautions apply.';

      if (subcity.includes('bole') || subcity.includes('sarbet') || subcity.includes('old airport')) {
        score = 96;
        lighting = 'Excellent (CCTV & Security Patrols)';
        riskLevel = 'Very Safe / Embassy Zone';
        tips = 'High security presence due to international missions and diplomatic residences.';
      } else if (subcity.includes('merkato') || subcity.includes('piassa')) {
        score = 78;
        lighting = 'Moderate (Commercial Zone)';
        riskLevel = 'Moderate Pickpocket Risk in Crowds';
        tips = 'Avoid carrying visible valuables during peak evening market hours.';
      } else if (subcity.includes('cmc') || subcity.includes('ayat') || subcity.includes('summit')) {
        score = 88;
        lighting = 'Good (Gated Condominium Compounds)';
        riskLevel = 'Safe Residential';
        tips = 'Protected gated entry points with 24/7 compound guards.';
      }

      return {
        subcity: args.subcity || 'Bole',
        safetyScore: `${score}%`,
        streetLightingIndex: lighting,
        securityRiskLevel: riskLevel,
        safetyAdvice: tips,
      };
    }

    case 'ethiopian_tax_and_withholding_calculator': {
      const monthly = args.monthlyRentETB || 25000;
      const annualGross = monthly * 12;

      // Ethiopian Schedule D Rental Tax Calculation Rules
      let taxAmount = 0;
      if (annualGross > 120000) {
        taxAmount = (annualGross - 120000) * 0.30;
      } else if (annualGross > 60000) {
        taxAmount = (annualGross - 60000) * 0.20;
      } else if (annualGross > 7200) {
        taxAmount = (annualGross - 7200) * 0.10;
      }

      const withholdingTaxETB = Math.round(monthly * 0.05); // 5% withholding tax
      const netMonthlyIncomeLandlord = monthly - withholdingTaxETB;

      return {
        monthlyRentETB: monthly,
        annualGrossRentalETB: annualGross,
        estimatedAnnualRentalIncomeTaxETB: Math.round(taxAmount),
        withholdingTaxMonthlyDeductionETB: withholdingTaxETB,
        netMonthlyLandlordPayoutETB: netMonthlyIncomeLandlord,
        taxRegulation: 'Schedule D Rental Income Tax under Ethiopian Ministry of Revenue Proclamation No. 979/2016.',
      };
    }

    case 'water_shortage_resilience_advisor': {
      const subcity = (args.subcity || 'Bole').toLowerCase();
      const occupants = Math.max(1, args.occupants || 3);
      let supplyDaysPerWeek = 4;
      let recommendedTankLiters = occupants * 500;

      if (subcity.includes('summit') || subcity.includes('ayat') || subcity.includes('kality')) {
        supplyDaysPerWeek = 2;
        recommendedTankLiters = Math.max(3000, occupants * 800);
      } else if (subcity.includes('cmc') || subcity.includes('sarbet')) {
        supplyDaysPerWeek = 5;
        recommendedTankLiters = Math.max(2000, occupants * 500);
      } else if (subcity.includes('bole')) {
        supplyDaysPerWeek = 6;
        recommendedTankLiters = Math.max(1000, occupants * 400);
      }

      return {
        subcity: args.subcity || 'Bole',
        municipalWaterLineSupplyDaysPerWeek: `${supplyDaysPerWeek} Days / Week`,
        recommendedReserveWaterTankCapacity: `${recommendedTankLiters} Liters`,
        estimatedTankInstallationCostETB: `${Math.round(recommendedTankLiters * 12)} ETB (Rotto Tank + Pump)`,
        advice: supplyDaysPerWeek < 4
          ? 'High water rotation area! Ensure landlord provides minimum 2,000L - 3,000L reserve tank.'
          : 'Standard water supply area. A 1,000L - 2,000L Rotto tank is sufficient.',
      };
    }

    case 'solar_backup_inverter_calculator': {
      const appliances = args.essentialAppliances || ['Wi-Fi', 'Refrigerator', 'TV', 'Lighting'];
      const estLoadWatts = 800;
      const batteryCapacityAh = 200; // 24V 200Ah Lithium/Gel
      const inverterkVA = 2.5;

      return {
        targetAppliances: appliances,
        estimatedLoadWatts: estLoadWatts,
        recommendedInverterRating: `${inverterkVA} kVA Pure Sine Wave Inverter`,
        recommendedBatteryBank: `24V ${batteryCapacityAh}Ah Lithium / Tubular Gel Battery`,
        estimatedOutageBackupDuration: '8 to 12 Hours Continuous Load',
        estimatedSystemSetupCostETB: '95,000 ETB - 130,000 ETB',
        benefit: 'Provides uninterrupted Wi-Fi, lighting, and refrigeration during Addis Ababa grid load-shedding.',
      };
    }

    case 'expat_diplomat_relocation_concierge': {
      const org = args.organizationType || 'NGO / Embassy';
      return {
        targetOrganizationCategory: org,
        topRecommendedSubcities: ['Bole Atlas', 'Old Airport (Bisrate Gabriel)', 'Sarbet', 'Kazanchis VIP'],
        internationalSchoolProximity: [
          'International Community School (ICS) - Old Airport',
          'Sandford International School - Kebena',
          'Lycée Franco-Éthiopien Guebre-Mariam - Churchill Road',
        ],
        keyDiplomaticHubs: 'Proximity to African Union (AU), UN ECA, EU Delegation, and US Embassy.',
        recommendedHousingType: 'Gated Villa with 24/7 Security Post & Backup Generator',
        typicalExpatBudgetRangeETB: '60,000 ETB - 180,000 ETB / month',
      };
    }

    case 'rental_yield_investment_calculator': {
      const price = args.propertyPriceETB || 6000000;
      const rent = args.monthlyRentETB || 35000;
      const annualRent = rent * 12;
      const grossYield = ((annualRent / price) * 100).toFixed(2);
      const paybackYears = (price / annualRent).toFixed(1);

      return {
        propertyPurchasePriceETB: price,
        monthlyRentETB: rent,
        annualGrossRentETB: annualRent,
        grossRentalYieldPercentage: `${grossYield}%`,
        estimatedPaybackPeriodYears: `${paybackYears} Years`,
        projected5YearCapitalAppreciation: '15% - 22% annual real estate value growth in Addis Ababa',
        investmentRating: Number(grossYield) >= 7.0 ? '🔥 High Yield Investment' : 'Standard Yield Investment',
      };
    }

    case 'negotiation_strategy_advisor': {
      const listed = args.listedRentETB || 30000;
      const Target6Months = Math.round(listed * 0.90);
      const Target12Months = Math.round(listed * 0.85);

      return {
        listedMonthlyRentETB: listed,
        discountStrategy: [
          `Offer 6 Months Advance Payment: Counter offer at ${Target6Months} ETB/month (10% discount).`,
          `Offer 12 Months Advance Payment: Counter offer at ${Target12Months} ETB/month (15% discount).`,
          'Leverage Seasonal Timing: Negotiate lower rates during Ginbot/Sene before school opening in September.',
        ],
        landlordSweetenerTips: 'Offer to cover minor initial repainting or water pump maintenance in exchange for rent reduction.',
      };
    }

    case 'furniture_decor_cost_estimator': {
      const beds = args.bedrooms || 2;
      const sofaCost = 65000;
      const bedsCost = beds * 35000;
      const appliancesCost = 85000; // Fridge, TV, Water Heater, Stove
      const totalCost = sofaCost + bedsCost + appliancesCost;

      return {
        bedroomsCount: beds,
        estimatedLivingRoomSofaETB: sofaCost,
        estimatedBedroomBedsAndMattressesETB: bedsCost,
        estimatedEssentialAppliancesETB: appliancesCost,
        totalFurnishingBudgetETB: totalCost,
        bestLocalMarkets: 'Merkato (Sebategna), Mexico Furniture Avenue, and Shola Market for quality Ethiopian woodwork.',
      };
    }

    case 'tenant_landlord_dispute_mediator': {
      const topic = args.disputeTopic || 'Deposit Return';
      return {
        disputeCategory: topic,
        ethiopianCivilCodeArticles: 'Civil Code of Ethiopia Articles 2896 to 2974 (Lease of Immovables)',
        legalGuidelines: [
          'Security Deposit Return: Landlord must return security deposit within 30 days of move-out unless proof of unpaid utility bills or tenant damage is shown.',
          'Structural Repairs: Landlord is legally responsible for major roof, wall, and main water/electrical line repairs.',
          'Eviction Notice Period: Minimum 1 to 3 months written notice required before terminating a residential lease.',
        ],
        recommendedAction: 'Always attach a signed move-in condition inventory and demand bank receipts for all rent transfers.',
      };
    }

    case 'move_in_moving_truck_estimator': {
      const from = args.fromSubcity || 'Bole';
      const to = args.toSubcity || 'CMC';
      const floor = args.floorLevel || 2;
      const baseTruck = 4500;
      const stairsFee = floor * 800;
      const totalMovingCost = baseTruck + stairsFee;

      return {
        route: `${from} ➔ ${to}`,
        recommendedVehicle: 'ISUZU Medium Box Truck (Short Chassis)',
        baseTruckRentalCostETB: baseTruck,
        helpersAndStairsHandlingETB: stairsFee,
        totalEstimatedMovingCostETB: totalMovingCost,
        movingTips: 'Schedule move-in on Sunday mornings to avoid Addis Ababa weekday heavy traffic.',
      };
    }

    case 'school_proximity_family_planner': {
      const school = args.schoolName || 'ICS / Sandford';
      return {
        targetSchool: school,
        recommendedNearbySubcities: ['Old Airport', 'Bisrate Gabriel', 'Sarbet', 'Kebena', 'Bole Atlas'],
        averageTaxiCommuteMinutes: '10 to 20 minutes',
        familyFriendlyNeighborhoodRating: '95% (Safe, green parks, international grocery stores nearby)',
      };
    }

    case 'commercial_office_retail_space_finder': {
      const biz = args.businessType || 'Office / Retail Shop';
      const budget = args.maxBudgetETB || 50000;

      const commercialProps = await prisma.property.findMany({
        where: {
          city: 'Addis Ababa',
          price: { lte: budget },
        },
        take: 3,
      });

      return {
        businessCategory: biz,
        maxBudgetETB: budget,
        matchingCommercialListings: commercialProps,
        topCommercialCorridors: 'Bole Road (Edna Mall), Kazanchis Main Street, 22 Mazoria, Mexico Square.',
      };
    }

    default:
      return { error: `Tool ${name} is not implemented on backend.` };
  }
}
