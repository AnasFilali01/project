import { supabase } from './supabase';
import { SearchHistory } from '../types';

export class SearchHistoryManager {
  private static async getUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }

  static async addToHistory(data: Omit<SearchHistory, 'id' | 'user_id' | 'timestamp'>): Promise<SearchHistory> {
    try {
      const userId = await this.getUserId();
      
      const { data: newEntry, error } = await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          query: data.query,
          mode: data.mode,
          is_favorite: data.is_favorite,
          results_count: data.results_count,
          file_name: data.file_name
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to add to search history:', error);
        throw new Error(error.message || 'Failed to save search to history');
      }
      
      if (!newEntry) {
        throw new Error('No data returned after inserting search history');
      }

      return newEntry;
    } catch (error) {
      console.error('Failed to add search to history:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to save search history: ${error.message}`);
      }
      throw new Error('Failed to save search history');
    }
  }

  static async getHistory(): Promise<SearchHistory[]> {
    try {
      const userId = await this.getUserId();
      
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Failed to fetch search history:', error);
        throw new Error(error.message || 'Failed to load search history');
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get search history:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to load search history: ${error.message}`);
      }
      throw new Error('Failed to load search history');
    }
  }

  static async toggleFavorite(id: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      const { data: current, error: fetchError } = await supabase
        .from('search_history')
        .select('is_favorite')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Failed to fetch current favorite status:', fetchError);
        throw new Error(fetchError.message || 'Failed to update favorite status');
      }

      if (!current) {
        throw new Error('Search history entry not found');
      }

      const { error: updateError } = await supabase
        .from('search_history')
        .update({
          is_favorite: !current.is_favorite
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Failed to update favorite status:', updateError);
        throw new Error(updateError.message || 'Failed to update favorite status');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update favorite status: ${error.message}`);
      }
      throw new Error('Failed to update favorite status');
    }
  }

  static async deleteEntry(id: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to delete entry:', error);
        throw new Error(error.message || 'Failed to delete search history entry');
      }
    } catch (error) {
      console.error('Failed to delete search history entry:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to delete search history entry: ${error.message}`);
      }
      throw new Error('Failed to delete search history entry');
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', userId)
        .is('is_favorite', false);

      if (error) {
        console.error('Failed to clear history:', error);
        throw new Error(error.message || 'Failed to clear search history');
      }
    } catch (error) {
      console.error('Failed to clear search history:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to clear search history: ${error.message}`);
      }
      throw new Error('Failed to clear search history');
    }
  }
}