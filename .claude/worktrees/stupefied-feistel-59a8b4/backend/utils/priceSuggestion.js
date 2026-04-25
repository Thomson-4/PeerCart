/**
 * Round 7 — AI Price Suggestion
 * Calls Claude claude-sonnet-4-5 to suggest a fair resale price range.
 * Returns null on any failure — never crashes the server.
 */

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are a pricing assistant for a college student marketplace in India.
Suggest a fair resale price range in Indian Rupees based on the item details.
Consider that buyers are college students with limited budgets.
Respond ONLY with valid JSON in this exact format, nothing else:
{ "minPrice": number, "maxPrice": number, "suggestedPrice": number, "reasoning": "one sentence explanation" }
All prices must be realistic for Indian college students (Rs 50 to Rs 50000 max).
Never suggest prices above Rs 50000.`;

/**
 * @param {{ title: string, description: string, category: string, condition: string }} params
 * @returns {Promise<{ minPrice: number, maxPrice: number, suggestedPrice: number, reasoning: string }|null>}
 *          All prices in rupees (caller converts to paise before storing)
 */
const suggestPrice = async ({ title, description, category, condition }) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[priceSuggestion] ANTHROPIC_API_KEY not set — skipping');
    return null;
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userMessage = `Item: ${title}. Description: ${description}. Category: ${category}. Condition: ${condition}.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0]?.text?.trim();
    if (!text) return null;

    // Strip markdown code fences if present
    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Basic sanity checks
    const { minPrice, maxPrice, suggestedPrice, reasoning } = parsed;
    if (
      typeof minPrice !== 'number' ||
      typeof maxPrice !== 'number' ||
      typeof suggestedPrice !== 'number' ||
      minPrice < 0 || maxPrice > 50_000 || suggestedPrice < 0
    ) {
      console.warn('[priceSuggestion] Response out of expected range:', parsed);
      return null;
    }

    return { minPrice, maxPrice, suggestedPrice, reasoning: String(reasoning) };
  } catch (err) {
    console.error('[priceSuggestion] Error:', err.message);
    return null;
  }
};

module.exports = { suggestPrice };
