import OpenAI from 'openai';

export interface AnalyzedResult {
  Title: string;
  URL: string;
  Description: string;
  CompanyName: string;
  Phone: string;
  City: string;
  Country: string;
  Activity: string;
  Email: string;
  Searchstring: string;
}

class OpenAIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export async function analyzeResults(
  query: string,
  results: { title: string; url: string; description: string }[],
  apiKey: string
): Promise<AnalyzedResult[]> {
  if (!results || results.length === 0) {
    throw new OpenAIError('No results to analyze');
  }

  if (!apiKey.trim()) {
    throw new OpenAIError('OpenAI API key is required');
  }

  const openai = new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const resultsText = results
    .map(
      (result) =>
        `Title: ${result.title}\nURL: ${result.url}\nDescription: ${result.description}\n---`
    )
    .join('\n');

  const systemPrompt = `You are an expert data analyst specializing in extracting structured business information from search results. Your responses must ALWAYS be in valid JSON array format containing analyzed data objects.`;

  const userPrompt = `
Analyze these search results for the query "${query}" and extract business information.

Search Results:
${resultsText}

Requirements:
1. Return ONLY a valid JSON array of objects, nothing else
2. Each object must have these fields (use empty string if not found):
   - Title: The original result title
   - URL: The website URL
   - Description: A concise business description
   - CompanyName: The company name
   - Phone: Contact number
   - City: Business city
   - Country: Business country
   - Activity: Business type/category
   - Email: Contact email
   - Searchstring: Company name + city + country (lowercase)
3. Filter out:
   - Non-business results
   - Generic articles
   - Forum posts
   - Duplicate entries
4. Ensure all strings are properly escaped
5. Maintain valid JSON structure

Example response format:
[
  {
    "Title": "Example Corp - Business Solutions",
    "URL": "https://example.com",
    "Description": "Professional business services",
    "CompanyName": "Example Corp",
    "Phone": "+1 234 567 8900",
    "City": "New York",
    "Country": "USA",
    "Activity": "Business Consulting",
    "Email": "contact@example.com",
    "Searchstring": "example corp new york usa"
  }
]

IMPORTANT: Your response must be ONLY the JSON array, with no additional text or explanation.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new OpenAIError('Empty response from OpenAI');
    }

    try {
      const parsedResults = JSON.parse(content);
      
      if (!Array.isArray(parsedResults)) {
        throw new OpenAIError('Invalid response format: expected an array');
      }

      // Validate and clean each result
      return parsedResults.map(result => ({
        Title: String(result.Title || ''),
        URL: String(result.URL || ''),
        Description: String(result.Description || ''),
        CompanyName: String(result.CompanyName || ''),
        Phone: String(result.Phone || ''),
        City: String(result.City || ''),
        Country: String(result.Country || ''),
        Activity: String(result.Activity || ''),
        Email: String(result.Email || ''),
        Searchstring: String(result.Searchstring || '').toLowerCase(),
      }));
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw response:', content);
      throw new OpenAIError(
        'Failed to parse search results',
        'PARSE_ERROR',
        { content, error: parseError }
      );
    }
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }

    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API error:', error);
      switch (error.status) {
        case 401:
          throw new OpenAIError('Invalid OpenAI API key', 'AUTH_ERROR');
        case 429:
          throw new OpenAIError('Rate limit exceeded. Please try again later.', 'RATE_LIMIT');
        case 500:
          throw new OpenAIError('OpenAI service error. Please try again later.', 'SERVICE_ERROR');
        default:
          throw new OpenAIError(`OpenAI API error: ${error.message}`, 'API_ERROR');
      }
    }

    throw new OpenAIError(
      'Unexpected error during analysis',
      'UNKNOWN_ERROR',
      error
    );
  }
}