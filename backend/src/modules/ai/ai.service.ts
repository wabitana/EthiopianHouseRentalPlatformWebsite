import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { executeAiTool, ToolContext } from './ai.tools';
import { getConversationHistory, saveConversationHistory, ChatMessage } from './ai.memory';
import { createLangChainTools, ToolExecutionCollector } from './ai.langchain.tools';

export interface AiProcessOptions {
  message: string;
  conversationId: string;
  context: ToolContext;
}

export interface AiProcessResult {
  message: string;
  properties: any[];
  actions: string[];
  conversationId: string;
}

const SYSTEM_PROMPT_TEXT = `You are the official AI Housing Assistant for the Ethiopian House Rental platform.
Your job is to help users find houses, understand rental terms in Ethiopia, and assist house providers with listings.

EXPANDED DOMAIN CAPABILITIES:
- You have specialized tools for: Neighborhood Safety Scores, Schedule D Ethiopian Rental Tax, Water Shortage & Tank Sizing, Solar Inverter Backup Sizing, Expat/Diplomat Concierge (ICS, Sandford, UN ECA), Rental Yield ROI, Ginbot/Sene Negotiation Strategies, Local Furniture Estimator (Merkato/Mexico prices), Ethiopian Civil Code Lease Dispute Guidance (Articles 2896–2974), ISUZU Moving Truck Logistics, School Proximity Planning, and Commercial Shop/Office Search.
- Proactively call these tools whenever relevant to give users extraordinary, insightful, and comprehensive guidance.

ABSOLUTE STRICT RULES:
1. NEVER INVENT OR HALLUCINATE PROPERTIES, PRICES, LOCATIONS, PROVIDERS, OR AVAILABILITY.
2. Every house recommendation MUST come from calling database search tools (such as 'search_properties', 'search_by_location', 'search_by_budget', 'recommend_properties').
3. If no properties match the user search criteria in the database, clearly state that no matching properties were found in the platform database. DO NOT CREATE FAKE LISTINGS.
4. Support both English and Amharic naturally. If the user asks in Amharic (e.g., "በቦሌ 25000 ብር በታች 2 መኝታ ቤት ፈልግልኝ"), search the database and respond in clear Amharic.
5. All price values are in Ethiopian Birr (ETB).
6. Provide detailed, rich, helpful responses explaining matched properties, location highlights, and rental terms.
7. DO NOT output raw markdown image URLs or syntax like '![Image 1](url)'. The mobile application automatically renders high-resolution interactive property cards and live map views below your text response.
8. Format text cleanly and naturally for app display.
9. When users ask to see homes on the map or location views (e.g. "show me homes on map"), mention that an interactive live map with property price pins is available right below in the message view.`;

export async function processAiChat(options: AiProcessOptions): Promise<AiProcessResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const conversationId = options.conversationId || `conv-${Date.now()}`;

  // Fallback if no valid OpenRouter API key configured
  if (!apiKey || apiKey.includes('demo-key')) {
    return handleDirectDbFallback(options.message, conversationId, options.context);
  }

  // Dynamically map OPENROUTER_API_KEY for LangChain / OpenAI SDK internal calls
  process.env.OPENAI_API_KEY = apiKey;
  process.env.OPENAI_BASE_URL = 'https://openrouter.ai/api/v1';

  try {
    const history = getConversationHistory(conversationId);
    const langchainMessages: (HumanMessage | AIMessage)[] = [];

    for (const msg of history) {
      if (msg.role === 'user') {
        langchainMessages.push(new HumanMessage(msg.content || ''));
      } else if (msg.role === 'assistant' && msg.content) {
        langchainMessages.push(new AIMessage(msg.content || ''));
      }
    }

    langchainMessages.push(new HumanMessage(options.message || ''));

    const collector: ToolExecutionCollector = {
      properties: new Map(),
      actions: [],
    };

    const model = new ChatOpenAI({
      apiKey: apiKey,
      modelName: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://ethiopianhouserental.com',
          'X-Title': 'Ethiopian House Rental AI Assistant',
        },
      },
      temperature: 0.3,
    });

    const tools = createLangChainTools(options.context, collector);

    // LangGraph ReAct Agent StateGraph execution with prompt parameter
    const agent = createReactAgent({
      llm: model,
      tools: tools,
      prompt: SYSTEM_PROMPT_TEXT,
    });

    const agentResult = await agent.invoke({
      messages: langchainMessages,
    });

    const outputMessages = agentResult.messages || [];
    const finalMsg = outputMessages[outputMessages.length - 1];

    let finalAssistantResponse = 'I searched the database to help you find matching properties.';
    if (finalMsg && finalMsg.content) {
      finalAssistantResponse = typeof finalMsg.content === 'string'
        ? finalMsg.content
        : JSON.stringify(finalMsg.content);
    }

    // Persist updated conversation memory
    const updatedHistory: ChatMessage[] = [];
    for (const m of outputMessages) {
      if (m instanceof HumanMessage) {
        updatedHistory.push({ role: 'user', content: String(m.content) });
      } else if (m instanceof AIMessage && m.content) {
        updatedHistory.push({ role: 'assistant', content: String(m.content) });
      }
    }
    saveConversationHistory(conversationId, updatedHistory);

    return {
      message: finalAssistantResponse,
      properties: Array.from(collector.properties.values()),
      actions: collector.actions,
      conversationId,
    };
  } catch (error) {
    console.error('LangChain / LangGraph AI Service Error:', error);
    return handleDirectDbFallback(options.message, conversationId, options.context);
  }
}

// Fallback direct backend DB search engine when OpenRouter is unconfigured or unavailable
export async function handleDirectDbFallback(message: string, conversationId: string, ctx: ToolContext): Promise<AiProcessResult> {
  const lowerMsg = message.toLowerCase();
  const isAmharic = /[\u1200-\u137F]/.test(message);

  if (lowerMsg.includes('lease') || lowerMsg.includes('contract') || lowerMsg.includes('ውል')) {
    const leaseRes = await executeAiTool('generate_amharic_lease_draft', { tenantName: ctx.userName || 'Tenant' }, ctx);
    return {
      message: `${leaseRes.amharicContractTitle}\n\n${leaseRes.keyTermsAmharic.join('\n')}`,
      properties: [],
      actions: ['Generated Amharic & English Lease Draft'],
      conversationId,
    };
  }

  if (lowerMsg.includes('commute') || lowerMsg.includes('taxi') || lowerMsg.includes('distance')) {
    const commuteRes = await executeAiTool('calculate_commute_time', { destinationHub: 'Kazanchis / City Center' }, ctx);
    return {
      message: `🚕 Commute Breakdown to ${commuteRes.destination}:\n• Minibus Taxi: ${commuteRes.estimatedMinibusTaxiMinutes}\n• Light Rail: ${commuteRes.estimatedLightRailMinutes}\n• Ride-Hail / Uber: ${commuteRes.estimatedUberRideHailCostETB}\n\nRoute: ${commuteRes.recommendedRoute}`,
      properties: [],
      actions: ['Calculated Transport & Commute Time'],
      conversationId,
    };
  }

  if (lowerMsg.includes('roommate') || lowerMsg.includes('split') || lowerMsg.includes('share')) {
    const splitRes = await executeAiTool('roommate_matching_calculator', { roommatesCount: 2 }, ctx);
    return {
      message: `👥 Roommate Expense Split Calculator (2 Roommates):\n• Total Monthly Rent + Utilities: ${splitRes.totalMonthlyExpenseETB} ETB\n• Per Person Share: ${splitRes.perPersonMonthlyShareETB} ETB/month\n\nBreakdown per roommate:\n- Rent Share: ${splitRes.expenseBreakdownPerPerson.rentShare} ETB\n- Water Tank Refill: ${splitRes.expenseBreakdownPerPerson.waterRefillShare} ETB\n- Security Guard: ${splitRes.expenseBreakdownPerPerson.securityGuardShare} ETB`,
      properties: [],
      actions: ['Calculated Roommate Bill Split'],
      conversationId,
    };
  }

  if (lowerMsg.includes('check') || lowerMsg.includes('inspect') || lowerMsg.includes('deposit') || lowerMsg.includes('term') || lowerMsg.includes('document')) {
    if (lowerMsg.includes('check') || lowerMsg.includes('inspect')) {
      const checklistRes = await executeAiTool('generate_visit_checklist', {}, ctx);
      const items = checklistRes.checklist.map((item: string) => `• ${item}`).join('\n');
      return {
        message: `Here is a practical checklist of key things to inspect when visiting a rental property in Ethiopia:\n\n${items}\n\nAlways request a formal written lease agreement before making any advance rent payment.`,
        properties: [],
        actions: ['Generated Rental Inspection Checklist'],
        conversationId,
      };
    }

    if (lowerMsg.includes('term') || lowerMsg.includes('deposit')) {
      const termsRes = await executeAiTool('explain_rental_terms', {}, ctx);
      return {
        message: `Standard Ethiopian Rental Lease Terms:\n• Advance Rent: ${termsRes.standardAdvancePayment}\n• Security Deposit: ${termsRes.securityDeposit}\n• Utilities: ${termsRes.utilityBills}`,
        properties: [],
        actions: ['Explained Lease Terms'],
        conversationId,
      };
    }
  }

  let properties: any[] = [];
  let responseText = '';

  let city = 'Addis Ababa';
  let area: string | undefined;
  let maxPrice: number | undefined;
  let bedrooms: number | undefined;

  const priceMatch = message.match(/(\d{4,6})/);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  const bedMatch = message.match(/(\d)\s*(bedroom|bed|መኝታ)/i);
  if (bedMatch) {
    bedrooms = parseInt(bedMatch[1], 10);
  }

  const locations = ['Bole', 'Kazanchis', 'Sarbet', 'CMC', 'Ayat', 'Summit', 'Piassa', 'Mekelle', 'Hawassa', 'Bahir Dar'];
  for (const loc of locations) {
    if (lowerMsg.includes(loc.toLowerCase())) {
      area = loc;
      break;
    }
  }

  const searchResult = await executeAiTool('search_properties', { city, area, maxPrice, bedrooms }, ctx);
  properties = searchResult.properties || [];

  if (isAmharic) {
    if (properties.length > 0) {
      responseText = `ከዳታቤዛችን ውስጥ ለፍላጎትዎ የሚሆኑ ${properties.length} ቤቶችን አግኝቻለሁ። ዝርዝሩን ከታች በተቀመጡት ካርዶች መመልከት ይችላሉ፡`;
    } else {
      responseText = `በተጠየቀው መስፈርት (${area ? area + ' ' : ''}${maxPrice ? maxPrice + ' ETB ' : ''}${bedrooms ? bedrooms + ' መኝታ' : ''}) የተመዘገበ ክፍት ቤት በዳታቤዛችን ውስጥ አልተገኘም። እባክዎን የዋጋ መጠን ወይም ቦታ ቀይረው ይሞክሩ።`;
    }
  } else {
    if (properties.length > 0) {
      responseText = `I searched our real platform database and found ${properties.length} matching properties for your request. You can explore them in the property cards below:`;
    } else {
      responseText = `I searched our platform database, but no available properties matched your exact criteria (${area ? 'Location: ' + area + ', ' : ''}${maxPrice ? 'Max Price: ' + maxPrice + ' ETB, ' : ''}${bedrooms ? 'Bedrooms: ' + bedrooms : ''}). Try adjusting your budget or preferred subcity.`;
    }
  }

  return {
    message: responseText,
    properties,
    actions: ['Direct Database Search Executed'],
    conversationId,
  };
}
