import { supabase } from './supabase';

interface TokenData {
  apifyToken: string;
  openaiKey: string;
}

export class TokenStorage {
  private static async getUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }

  static async storeTokens(tokens: TokenData): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      // First, check if tokens exist for this user
      const { data: existingTokens, error: fetchError } = await supabase
        .from('user_tokens')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingTokens) {
        // Update existing tokens
        const { error: updateError } = await supabase
          .from('user_tokens')
          .update({
            apify_token: tokens.apifyToken,
            openai_key: tokens.openaiKey,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Insert new tokens
        const { error: insertError } = await supabase
          .from('user_tokens')
          .insert({
            user_id: userId,
            apify_token: tokens.apifyToken,
            openai_key: tokens.openaiKey,
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to save API keys');
    }
  }

  static async getTokens(): Promise<TokenData | null> {
    try {
      const userId = await this.getUserId();
      
      const { data, error } = await supabase
        .from('user_tokens')
        .select('apify_token, openai_key')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? {
        apifyToken: data.apify_token,
        openaiKey: data.openai_key
      } : null;
    } catch (error) {
      if (error instanceof Error && error.message === 'User not authenticated') {
        return null;
      }
      console.error('Failed to load tokens:', error);
      return null;
    }
  }

  static async deleteTokens(): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      const { error } = await supabase
        .from('user_tokens')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete tokens:', error);
      throw new Error('Failed to delete API keys');
    }
  }
}