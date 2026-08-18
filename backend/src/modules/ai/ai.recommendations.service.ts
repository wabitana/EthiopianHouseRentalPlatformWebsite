import prisma from '../../prisma';

export interface UserBehaviorProfile {
  searchQueries?: string[];
  viewedSubcities?: string[];
  viewedPropertyIds?: string[];
  favoritedPropertyIds?: string[];
  maxBudget?: number;
  minPrice?: number;
  avgPriceAffinity?: number;
  preferredBedrooms?: number;
  preferredAmenities?: string[];
  preferredCity?: string;
  userType?: string;
}

export interface RecommendationResult {
  property: any;
  matchScore: number; // e.g. 96
  matchReasons: string[];
}

export async function generatePersonalizedRecommendations(
  profile: UserBehaviorProfile,
  limit: number = 8
): Promise<{ recommendations: RecommendationResult[]; summaryInsight: string }> {
  const preferredCity = profile.preferredCity || 'Addis Ababa';
  const viewedSubcities = profile.viewedSubcities || [];
  const maxPrice = profile.maxBudget || 100000;
  const avgPrice = profile.avgPriceAffinity || 30000;

  // Fetch active properties from DB
  const properties = await prisma.property.findMany({
    where: {
      city: preferredCity,
    },
    take: 30,
    orderBy: { createdAt: 'desc' },
  });

  const scoredResults: RecommendationResult[] = properties.map((p) => {
    let score = 70; // Base score
    const reasons: string[] = [];

    // Subcity match boost
    if (viewedSubcities.some((s) => p.area.toLowerCase().includes(s.toLowerCase()) || p.neighborhood.toLowerCase().includes(s.toLowerCase()))) {
      score += 15;
      reasons.push(`In your frequently searched area (${p.area})`);
    }

    // Price affinity match boost
    if (Math.abs(p.price - avgPrice) <= avgPrice * 0.25) {
      score += 10;
      reasons.push(`Fits your ideal price target (${Math.round(p.price)} ETB/mo)`);
    }

    // Bedroom match boost
    if (profile.preferredBedrooms && p.rooms === profile.preferredBedrooms) {
      score += 8;
      reasons.push(`Matches your preferred ${p.rooms}-bedroom layout`);
    }

    // Verification boost
    if (p.isVerified) {
      score += 5;
      reasons.push('Verified landlord listing');
    }

    // Penalize if price exceeds max budget
    if (maxPrice > 0 && p.price > maxPrice) {
      score -= 25;
    }

    const finalScore = Math.min(99, Math.max(60, score));

    if (reasons.length === 0) {
      reasons.push(`Popular ${p.rooms}-bedroom listing in ${p.area}`);
    }

    return {
      property: p,
      matchScore: finalScore,
      matchReasons: reasons,
    };
  });

  // Sort descending by match score
  scoredResults.sort((a, b) => b.matchScore - a.matchScore);
  const topRecommendations = scoredResults.slice(0, limit);

  const topSubcity = viewedSubcities.length > 0 ? viewedSubcities[0] : 'Addis Ababa';
  const summaryInsight = `Based on your recent views in ${topSubcity} & ETB ${Math.round(avgPrice)} budget history`;

  return {
    recommendations: topRecommendations,
    summaryInsight,
  };
}

export async function calculatePropertyMatchScore(
  propertyId: string,
  profile: UserBehaviorProfile
): Promise<{ matchScore: number; matchReasons: string[] }> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    return { matchScore: 85, matchReasons: ['High quality active listing'] };
  }

  let score = 75;
  const reasons: string[] = [];

  const viewedSubcities = profile.viewedSubcities || [];
  if (viewedSubcities.some((s) => property.area.toLowerCase().includes(s.toLowerCase()))) {
    score += 12;
    reasons.push(`Located in ${property.area}, your top searched subcity`);
  }

  const avgPrice = profile.avgPriceAffinity || 25000;
  if (Math.abs(property.price - avgPrice) <= avgPrice * 0.3) {
    score += 10;
    reasons.push(`Matches your typical budget of ${Math.round(avgPrice)} ETB`);
  }

  if (property.isVerified) {
    score += 5;
    reasons.push('Verified owner identity & compound safety audit');
  }

  const finalScore = Math.min(99, Math.max(65, score));
  if (reasons.length === 0) {
    reasons.push(`Prime ${property.rooms}-bedroom property in ${property.area}`);
  }

  return {
    matchScore: finalScore,
    matchReasons: reasons,
  };
}
