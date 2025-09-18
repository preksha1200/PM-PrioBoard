import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type ProductProfile = Database['public']['Tables']['product_profiles']['Row']
type ProductProfileInsert = Database['public']['Tables']['product_profiles']['Insert']
type ProductProfileUpdate = Database['public']['Tables']['product_profiles']['Update']

type Idea = Database['public']['Tables']['ideas']['Row']
type IdeaInsert = Database['public']['Tables']['ideas']['Insert']
type IdeaUpdate = Database['public']['Tables']['ideas']['Update']

// Product Profile operations
export const productProfileService = {
  async getAll(): Promise<ProductProfile[]> {
    const { data, error } = await supabase
      .from('product_profiles')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<ProductProfile | null> {
    const { data, error } = await supabase
      .from('product_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  async create(profile: Omit<ProductProfileInsert, 'user_id'>): Promise<ProductProfile> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('product_profiles')
      .insert({
        ...profile,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: ProductProfileUpdate): Promise<ProductProfile> {
    const { data, error } = await supabase
      .from('product_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_profiles')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Ideas operations
export const ideasService = {
  async getAll(productProfileId?: string): Promise<Idea[]> {
    let query = supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })

    if (productProfileId) {
      query = query.eq('product_profile_id', productProfileId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Idea | null> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  async create(idea: Omit<IdeaInsert, 'user_id'>): Promise<Idea> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        ...idea,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createMany(ideas: Omit<IdeaInsert, 'user_id'>[]): Promise<Idea[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const ideasWithUserId = ideas.map(idea => ({
      ...idea,
      user_id: user.id
    }))

    const { data, error } = await supabase
      .from('ideas')
      .insert(ideasWithUserId)
      .select()

    if (error) throw error
    return data || []
  },

  async update(id: string, updates: IdeaUpdate): Promise<Idea> {
    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async deleteMany(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .in('id', ids)

    if (error) throw error
  }
}

// Utility functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
