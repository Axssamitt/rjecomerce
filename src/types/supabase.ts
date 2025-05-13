
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string
          price: number
          description: string
          image_url: string
          purchase_link: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          price: number
          description: string
          image_url: string
          purchase_link: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          description?: string
          image_url?: string
          purchase_link?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: number
          username: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: number
          username: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: number
          username?: string
          password_hash?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row'];
export type NewProduct = Database['public']['Tables']['products']['Insert'];
export type UpdateProduct = Database['public']['Tables']['products']['Update'];
