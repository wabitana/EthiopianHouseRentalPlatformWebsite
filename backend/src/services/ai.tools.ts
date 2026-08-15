import { prisma } from '../prisma';

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

    default:
      return { error: `Tool ${name} is not implemented on backend.` };
  }
}
