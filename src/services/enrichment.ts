import OpenAI from 'openai';
import { z } from 'zod';

export interface EnrichmentResult {
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  employeeCount: {
    estimate: number;
    confidence: number;
    range: {
      min: number;
      max: number;
    };
  };
  revenue: {
    estimate: number;
    currency: string;
    confidence: number;
    range: {
      min: number;
      max: number;
    };
  };
  industry: {
    primary: string;
    secondary: string[];
    confidence: number;
  };
  competitors: {
    name: string;
    url?: string;
    similarity: number;
  }[];
}

// More permissive schema that allows null values
const enrichmentSchema = z.object({
  socialProfiles: z.object({
    linkedin: z.string().url().nullish(),
    twitter: z.string().url().nullish(),
    facebook: z.string().url().nullish(),
    instagram: z.string().url().nullish(),
  }).transform(data => ({
    linkedin: data.linkedin || undefined,
    twitter: data.twitter || undefined,
    facebook: data.facebook || undefined,
    instagram: data.instagram || undefined,
  })),
  employeeCount: z.object({
    estimate: z.number().int().positive(),
    confidence: z.number().min(0).max(1),
    range: z.object({
      min: z.number().int().positive(),
      max: z.number().int().positive(),
    }),
  }),
  revenue: z.object({
    estimate: z.number().positive(),
    currency: z.string(),
    confidence: z.number().min(0).max(1),
    range: z.object({
      min: z.number().positive(),
      max: z.number().positive(),
    }),
  }),
  industry: z.object({
    primary: z.string(),
    secondary: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),
  competitors: z.array(z.object({
    name: z.string(),
    url: z.string().url().nullish(),
    similarity: z.number().min(0).max(1),
  })).transform(competitors => 
    competitors.map(comp => ({
      ...comp,
      url: comp.url || undefined,
    }))
  ),
});

export class EnrichmentService {
  private static async analyzeWithAI(
    companyData: string,
    apiKey: string
  ): Promise<EnrichmentResult> {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const systemPrompt = `You are an expert business analyst specializing in company data enrichment. 
    Your task is to analyze company information and return detailed estimates in a specific JSON format.
    IMPORTANT: 
    - Return ONLY valid JSON
    - Use null for missing social media URLs, never empty strings or invalid URLs
    - All numbers must be positive
    - Confidence scores must be between 0 and 1
    - URLs must include https://`;

    const userPrompt = `
    Analyze this company information and provide enriched data:
    ${companyData}

    Return a JSON object with this exact structure:
    {
      "socialProfiles": {
        "linkedin": "URL or null",
        "twitter": "URL or null",
        "facebook": "URL or null",
        "instagram": "URL or null"
      },
      "employeeCount": {
        "estimate": number,
        "confidence": 0-1,
        "range": {
          "min": number,
          "max": number
        }
      },
      "revenue": {
        "estimate": number,
        "currency": "USD",
        "confidence": 0-1,
        "range": {
          "min": number,
          "max": number
        }
      },
      "industry": {
        "primary": "string",
        "secondary": ["string"],
        "confidence": 0-1
      },
      "competitors": [
        {
          "name": "string",
          "url": "URL or null",
          "similarity": 0-1
        }
      ]
    }

    Guidelines:
    1. Use realistic estimates based on available information
    2. Confidence scores should reflect uncertainty (0-1)
    3. Ranges should be reasonable for company size
    4. Use null for missing social media URLs
    5. List relevant competitors in the same industry/region
    6. All numbers must be positive
    7. URLs must be valid and complete (including https://)`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      try {
        const parsedData = JSON.parse(content);
        const validatedData = enrichmentSchema.parse(parsedData);
        return validatedData;
      } catch (parseError) {
        if (parseError instanceof z.ZodError) {
          console.error('Validation errors:', JSON.stringify(parseError.errors, null, 2));
          throw new Error('Invalid data format in enrichment response');
        }
        console.error('Failed to parse OpenAI response:', parseError);
        console.error('Raw response:', content);
        throw new Error('Failed to parse enrichment data');
      }
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        console.error('OpenAI API error:', error);
        switch (error.status) {
          case 400:
            throw new Error('Invalid request to OpenAI API');
          case 401:
            throw new Error('Invalid OpenAI API key');
          case 429:
            throw new Error('OpenAI rate limit exceeded. Please try again later.');
          case 500:
            throw new Error('OpenAI service error. Please try again later.');
          default:
            throw new Error(`OpenAI API error: ${error.message}`);
        }
      }

      // Re-throw parsed errors
      if (error instanceof Error) {
        throw error;
      }

      // Fallback for unknown errors
      console.error('Enrichment error:', error);
      throw new Error('Failed to enrich company data');
    }
  }

  static async enrichCompanyData(
    companyName: string,
    description: string,
    location: string,
    activity: string,
    apiKey: string
  ): Promise<EnrichmentResult> {
    if (!companyName) {
      throw new Error('Company name is required');
    }

    const companyData = `
      Company Name: ${companyName}
      Description: ${description || 'Not provided'}
      Location: ${location || 'Not provided'}
      Activity: ${activity || 'Not provided'}
    `;

    return this.analyzeWithAI(companyData, apiKey);
  }
}