export type Database = {
  public: {
    Tables: {
      family_members: {
        Row: {
          id: string
          full_name: string
          relationship_to_grandpa: string
          parent_id: string | null
          spouse_id: string | null
          photo_url: string | null
          bio_note: string | null
          submitted_by_email: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['family_members']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['family_members']['Insert']>
      }
      memories: {
        Row: {
          id: string
          author_name: string
          author_relationship: string | null
          title: string | null
          message: string
          photo_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['memories']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['memories']['Insert']>
      }
      gallery_photos: {
        Row: {
          id: string
          album_name: string
          image_url: string
          caption: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['gallery_photos']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['gallery_photos']['Insert']>
      }
      biography_sections: {
        Row: {
          id: string
          section_key: string
          heading: string
          body: string
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['biography_sections']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['biography_sections']['Insert']>
      }
      timeline_events: {
        Row: {
          id: string
          year: string
          title: string
          description: string | null
          photo_url: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['timeline_events']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['timeline_events']['Insert']>
      }
      service_events: {
        Row: {
          id: string
          event_day: 'wake_keep' | 'burial'
          time: string
          title: string
          description: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['service_events']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['service_events']['Insert']>
      }
      site_settings: {
        Row: {
          id: string
          burial_datetime: string | null
          wake_keep_datetime: string | null
          venue_name: string | null
          venue_address: string | null
          livestream_url: string | null
          primary_color: string | null
          secondary_color: string | null
          accent_color: string | null
        }
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          full_name: string
          role: 'super_admin' | 'editor'
        }
        Insert: Database['public']['Tables']['admin_users']['Row']
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
    }
  }
}
