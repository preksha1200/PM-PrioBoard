import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      product_profiles: {
        Row: {
          id: string
          user_id: string
          product_name: string
          one_liner: string | null
          detailed_description: string | null
          north_star_metric: any | null
          secondary_kpis: any | null
          audience_scale: any | null
          business_context: any | null
          funnel_channels: any | null
          baseline_volumes: any | null
          team_effort_units: any | null
          custom_impact_ladder: any | null
          confidence_rubric: any | null
          constraints_risk: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_name: string
          one_liner?: string | null
          detailed_description?: string | null
          north_star_metric?: any | null
          secondary_kpis?: any | null
          audience_scale?: any | null
          business_context?: any | null
          funnel_channels?: any | null
          baseline_volumes?: any | null
          team_effort_units?: any | null
          custom_impact_ladder?: any | null
          confidence_rubric?: any | null
          constraints_risk?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_name?: string
          one_liner?: string | null
          detailed_description?: string | null
          north_star_metric?: any | null
          secondary_kpis?: any | null
          audience_scale?: any | null
          business_context?: any | null
          funnel_channels?: any | null
          baseline_volumes?: any | null
          team_effort_units?: any | null
          custom_impact_ladder?: any | null
          confidence_rubric?: any | null
          constraints_risk?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          product_profile_id: string | null
          title: string
          notes: string | null
          reach: number | null
          impact: number
          confidence: number
          effort: number
          score: number
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_profile_id?: string | null
          title: string
          notes?: string | null
          reach?: number | null
          impact: number
          confidence: number
          effort: number
          score: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_profile_id?: string | null
          title?: string
          notes?: string | null
          reach?: number | null
          impact?: number
          confidence?: number
          effort?: number
          score?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
