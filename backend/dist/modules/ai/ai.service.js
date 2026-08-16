"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAiChat = processAiChat;
const ai_tools_1 = require("./ai.tools");
const ai_permissions_1 = require("./ai.permissions");
const ai_memory_1 = require("./ai.memory");
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
async function processAiChat(options) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    const conversationId = options.conversationId || `conv-${Date.now()}`;
    const history = (0, ai_memory_1.getConversationHistory)(conversationId);
    // System Prompt for Ethiopian Housing Assistant
    const systemPrompt = {
        role: 'system',
        content: `You are the official AI Housing Assistant for the Ethiopian House Rental platform.
Your job is to help users find houses, understand rental terms in Ethiopia, and assist house providers with listings.

ABSOLUTE STRICT RULES:
1. NEVER INVENT OR HALLUCINATE PROPERTIES, PRICES, LOCATIONS, PROVIDERS, OR AVAILABILITY.
2. Every house recommendation MUST come from calling database search tools (such as 'search_properties', 'search_by_location', 'search_by_budget', 'recommend_properties').
3. If no properties match the user search criteria in the database, clearly state that no matching properties were found in the platform database. DO NOT CREATE FAKE LISTINGS.
4. Support both English and Amharic naturally. If the user asks in Amharic (e.g., "በቦሌ 25000 ብር በታች 2 መኝታ ቤት ፈልግልኝ"), search the database and respond in clear Amharic.
5. All price values are in Ethiopian Birr (ETB).
6. Keep recommendations honest, concise, and helpful.
7. DO NOT output raw markdown image URLs or syntax like '![Image 1](url)'. The mobile application automatically renders high-resolution interactive property cards below your text response.
8. Format text cleanly and naturally for app display.`,
    };
    // Build message history for request
    const messages = [];
    messages.push(systemPrompt);
    if (history.length > 0) {
        messages.push(...history);
    }
    messages.push({ role: 'user', content: options.message });
    const collectedProperties = new Map();
    const collectedActions = [];
    // Maximum tool call iterations safety cap
    const MAX_ITERATIONS = 5;
    let iterations = 0;
    let finalAssistantResponse = '';
    // Check if valid API key is present
    if (!apiKey || apiKey.includes('demo-key')) {
        // If no real OpenRouter key configured yet, execute smart backend DB tool search directly
        return handleDirectDbFallback(options.message, conversationId, options.context);
    }
    try {
        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const payload = {
                model,
                messages,
                tools: ai_tools_1.AI_TOOLS_DEFINITIONS,
                tool_choice: 'auto',
            };
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://ethiopianhouserental.com',
                    'X-Title': 'Ethiopian House Rental AI Assistant',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errText = await response.text();
                console.error('OpenRouter API Error:', errText);
                return handleDirectDbFallback(options.message, conversationId, options.context);
            }
            const data = (await response.json());
            const choice = data.choices?.[0];
            const responseMessage = choice?.message;
            if (!responseMessage) {
                break;
            }
            // Add assistant message to trajectory
            messages.push(responseMessage);
            // Check if tool calls were requested by AI model
            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                for (const toolCall of responseMessage.tool_calls) {
                    const fnName = toolCall.function.name;
                    let fnArgs = {};
                    try {
                        fnArgs = JSON.parse(toolCall.function.arguments || '{}');
                    }
                    catch (_) { }
                    // Enforce role authorization permissions
                    if (!(0, ai_permissions_1.isToolAllowed)(fnName, options.context)) {
                        messages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            name: fnName,
                            content: JSON.stringify({ error: `Permission denied for tool ${fnName}. User authentication or role required.` }),
                        });
                        continue;
                    }
                    // Execute tool query on main PostgreSQL DB
                    const toolResult = await (0, ai_tools_1.executeAiTool)(fnName, fnArgs, options.context);
                    // Collect properties for Flutter rendering
                    if (toolResult.properties && Array.isArray(toolResult.properties)) {
                        for (const p of toolResult.properties) {
                            collectedProperties.set(p.id, p);
                        }
                    }
                    else if (toolResult.property) {
                        collectedProperties.set(toolResult.property.id, toolResult.property);
                    }
                    else if (toolResult.recommendations && Array.isArray(toolResult.recommendations)) {
                        for (const r of toolResult.recommendations) {
                            if (r.property)
                                collectedProperties.set(r.property.id, r.property);
                        }
                    }
                    collectedActions.push(`Executed tool: ${fnName}`);
                    // Append tool execution result back to conversation
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: fnName,
                        content: JSON.stringify(toolResult),
                    });
                }
            }
            else {
                // Final text answer received from model
                finalAssistantResponse = responseMessage.content || '';
                break;
            }
        }
        // Update conversation memory
        (0, ai_memory_1.saveConversationHistory)(conversationId, messages.filter((m) => m.role !== 'system'));
        return {
            message: finalAssistantResponse || 'I searched the database to help you find matching properties.',
            properties: Array.from(collectedProperties.values()),
            actions: collectedActions,
            conversationId,
        };
    }
    catch (error) {
        console.error('AI Service Error:', error);
        return handleDirectDbFallback(options.message, conversationId, options.context);
    }
}
// Fallback direct backend DB search engine when OpenRouter is unconfigured or unavailable
async function handleDirectDbFallback(message, conversationId, ctx) {
    const lowerMsg = message.toLowerCase();
    const isAmharic = /[\u1200-\u137F]/.test(message);
    // Check if query is a general housing question (checklists, deposit, lease terms, contract, commute, roommate, scam)
    if (lowerMsg.includes('lease') || lowerMsg.includes('contract') || lowerMsg.includes('ውል')) {
        const leaseRes = await (0, ai_tools_1.executeAiTool)('generate_amharic_lease_draft', { tenantName: ctx.userName || 'Tenant' }, ctx);
        return {
            message: `${leaseRes.amharicContractTitle}\n\n${leaseRes.keyTermsAmharic.join('\n')}`,
            properties: [],
            actions: ['Generated Amharic & English Lease Draft'],
            conversationId,
        };
    }
    if (lowerMsg.includes('commute') || lowerMsg.includes('taxi') || lowerMsg.includes('distance')) {
        const commuteRes = await (0, ai_tools_1.executeAiTool)('calculate_commute_time', { destinationHub: 'Kazanchis / City Center' }, ctx);
        return {
            message: `🚕 Commute Breakdown to ${commuteRes.destination}:\n• Minibus Taxi: ${commuteRes.estimatedMinibusTaxiMinutes}\n• Light Rail: ${commuteRes.estimatedLightRailMinutes}\n• Ride-Hail / Uber: ${commuteRes.estimatedUberRideHailCostETB}\n\nRoute: ${commuteRes.recommendedRoute}`,
            properties: [],
            actions: ['Calculated Transport & Commute Time'],
            conversationId,
        };
    }
    if (lowerMsg.includes('roommate') || lowerMsg.includes('split') || lowerMsg.includes('share')) {
        const splitRes = await (0, ai_tools_1.executeAiTool)('roommate_matching_calculator', { roommatesCount: 2 }, ctx);
        return {
            message: `👥 Roommate Expense Split Calculator (2 Roommates):\n• Total Monthly Rent + Utilities: ${splitRes.totalMonthlyExpenseETB} ETB\n• Per Person Share: ${splitRes.perPersonMonthlyShareETB} ETB/month\n\nBreakdown per roommate:\n- Rent Share: ${splitRes.expenseBreakdownPerPerson.rentShare} ETB\n- Water Tank Refill: ${splitRes.expenseBreakdownPerPerson.waterRefillShare} ETB\n- Security Guard: ${splitRes.expenseBreakdownPerPerson.securityGuardShare} ETB`,
            properties: [],
            actions: ['Calculated Roommate Bill Split'],
            conversationId,
        };
    }
    if (lowerMsg.includes('check') || lowerMsg.includes('inspect') || lowerMsg.includes('deposit') || lowerMsg.includes('term') || lowerMsg.includes('document')) {
        if (lowerMsg.includes('check') || lowerMsg.includes('inspect')) {
            const checklistRes = await (0, ai_tools_1.executeAiTool)('generate_visit_checklist', {}, ctx);
            const items = checklistRes.checklist.map((item) => `• ${item}`).join('\n');
            return {
                message: `Here is a practical checklist of key things to inspect when visiting a rental property in Ethiopia:\n\n${items}\n\nAlways request a formal written lease agreement before making any advance rent payment.`,
                properties: [],
                actions: ['Generated Rental Inspection Checklist'],
                conversationId,
            };
        }
        if (lowerMsg.includes('term') || lowerMsg.includes('deposit')) {
            const termsRes = await (0, ai_tools_1.executeAiTool)('explain_rental_terms', {}, ctx);
            return {
                message: `Standard Ethiopian Rental Lease Terms:\n• Advance Rent: ${termsRes.standardAdvancePayment}\n• Security Deposit: ${termsRes.securityDeposit}\n• Utilities: ${termsRes.utilityBills}`,
                properties: [],
                actions: ['Explained Lease Terms'],
                conversationId,
            };
        }
    }
    // Otherwise perform natural language database property search
    let properties = [];
    let responseText = '';
    let city = 'Addis Ababa';
    let area;
    let maxPrice;
    let bedrooms;
    // Extract prices
    const priceMatch = message.match(/(\d{4,6})/);
    if (priceMatch) {
        maxPrice = parseInt(priceMatch[1], 10);
    }
    // Extract bedrooms
    const bedMatch = message.match(/(\d)\s*(bedroom|bed|መኝታ)/i);
    if (bedMatch) {
        bedrooms = parseInt(bedMatch[1], 10);
    }
    // Extract locations
    const locations = ['Bole', 'Kazanchis', 'Sarbet', 'CMC', 'Ayat', 'Summit', 'Piassa', 'Mekelle', 'Hawassa', 'Bahir Dar'];
    for (const loc of locations) {
        if (lowerMsg.includes(loc.toLowerCase())) {
            area = loc;
            break;
        }
    }
    // Execute database search tool directly
    const searchResult = await (0, ai_tools_1.executeAiTool)('search_properties', { city, area, maxPrice, bedrooms }, ctx);
    properties = searchResult.properties || [];
    if (isAmharic) {
        if (properties.length > 0) {
            responseText = `ከዳታቤዛችን ውስጥ ለፍላጎትዎ የሚሆኑ ${properties.length} ቤቶችን አግኝቻለሁ። ዝርዝሩን ከታች በተቀመጡት ካርዶች መመልከት ይችላሉ፡`;
        }
        else {
            responseText = `በተጠየቀው መስፈርት (${area ? area + ' ' : ''}${maxPrice ? maxPrice + ' ETB ' : ''}${bedrooms ? bedrooms + ' መኝታ' : ''}) የተመዘገበ ክፍት ቤት በዳታቤዛችን ውስጥ አልተገኘም። እባክዎን የዋጋ መጠን ወይም ቦታ ቀይረው ይሞክሩ።`;
        }
    }
    else {
        if (properties.length > 0) {
            responseText = `I searched our real platform database and found ${properties.length} matching properties for your request. You can explore them in the property cards below:`;
        }
        else {
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
