import axios, { AxiosError } from 'axios';

const APIFY_API_ENDPOINT = 'https://api.apify.com/v2';
const ACTOR_ID = 'apify~google-search-scraper';

export interface ApifyResult {
  title: string;
  url: string;
  description: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApifyError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApifyError';
  }
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries = 3,
  baseDelay = 1000,
  onRetry?: (error: Error, attempt: number) => void
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (i === retries - 1) break;
      
      if (onRetry) {
        onRetry(error as Error, i + 1);
      }
      
      // Exponential backoff
      await delay(baseDelay * Math.pow(2, i));
      
      // If it's a rate limit error, wait longer
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        await delay(5000); // Additional delay for rate limits
      }
    }
  }
  
  throw lastError;
}

function handleAxiosError(error: AxiosError): never {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status;
    const data = error.response.data as any;
    
    const errorMap: Record<number, string> = {
      400: 'Invalid request parameters',
      401: 'Invalid API token',
      403: 'Access forbidden',
      404: 'Resource not found',
      429: 'Rate limit exceeded',
      500: 'Apify server error',
      503: 'Service temporarily unavailable'
    };

    const message = errorMap[status] || 'An unexpected error occurred';
    throw new ApifyError(
      `Apify API error: ${message}`,
      status,
      data
    );
  } else if (error.request) {
    // The request was made but no response was received
    throw new ApifyError('Network error: No response received from Apify');
  } else {
    // Something happened in setting up the request
    throw new ApifyError(`Request setup error: ${error.message}`);
  }
}

export async function searchWithApify(
  query: string,
  apiToken: string,
  resultsPerPage = 5,
  maxPages = 1
): Promise<ApifyResult[]> {
  if (!query.trim()) {
    throw new ApifyError('Search query cannot be empty');
  }

  if (!apiToken.trim()) {
    throw new ApifyError('Apify API token is required');
  }

  try {
    // Start the actor run with retry logic
    const runResponse = await retryWithBackoff(
      () => axios.post(
        `${APIFY_API_ENDPOINT}/acts/${ACTOR_ID}/runs`,
        {
          queries: query,
          maxPagesPerQuery: maxPages,
          resultsPerPage,
          mobileResults: false,
          languageCode: 'en',
          maxConcurrency: 1,
          saveHtml: false,
          saveScreenshots: false,
          customDataFunction: ''
        },
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      ),
      3,
      1000,
      (error, attempt) => {
        console.warn(`Retry attempt ${attempt} failed:`, error);
      }
    );

    if (!runResponse.data?.data?.id) {
      throw new ApifyError('Invalid response from Apify API when starting the run');
    }

    const runId = runResponse.data.data.id;
    let retries = 0;
    const maxRetries = 24; // 2 minutes maximum wait time
    
    // Poll for completion with retry logic
    while (retries < maxRetries) {
      try {
        const statusResponse = await retryWithBackoff(
          () => axios.get(
            `${APIFY_API_ENDPOINT}/acts/${ACTOR_ID}/runs/${runId}`,
            {
              headers: {
                'Authorization': `Bearer ${apiToken}`,
              },
              timeout: 10000,
            }
          )
        );

        if (!statusResponse.data?.data) {
          throw new ApifyError('Invalid response from Apify API when checking status');
        }

        const status = statusResponse.data.data.status;
        
        if (status === 'SUCCEEDED') {
          const datasetId = statusResponse.data.data.defaultDatasetId;
          if (!datasetId) {
            throw new ApifyError('No dataset ID found in successful run');
          }

          const resultsResponse = await retryWithBackoff(
            () => axios.get(
              `${APIFY_API_ENDPOINT}/datasets/${datasetId}/items`,
              {
                headers: {
                  'Authorization': `Bearer ${apiToken}`,
                },
                timeout: 10000,
              }
            )
          );

          if (!Array.isArray(resultsResponse.data)) {
            throw new ApifyError('Invalid response format from Apify dataset');
          }

          // Process and validate the results
          const processedResults = resultsResponse.data
            .filter(item => item?.organicResults?.length > 0)
            .flatMap(item => 
              item.organicResults
                .filter(result => result.title && result.url)
                .map(result => ({
                  title: result.title || '',
                  url: result.url || '',
                  description: result.description || '',
                }))
            );

          if (processedResults.length === 0) {
            throw new ApifyError('No valid results found in the Apify response');
          }

          return processedResults;
        } 
        
        if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
          throw new ApifyError(`Actor run failed with status: ${status}`);
        }

        retries++;
        await delay(5000);
      } catch (error) {
        if (retries === maxRetries - 1) throw error;
        retries++;
        await delay(5000);
      }
    }

    throw new ApifyError('Actor run timed out after maximum retries');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      handleAxiosError(error);
    }
    
    if (error instanceof ApifyError) {
      throw error;
    }
    
    throw new ApifyError(
      'Unexpected error during Apify search',
      undefined,
      error
    );
  }
}