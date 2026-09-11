export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      case_results: {
        Row: {
          accusation_points: number
          case_id: string
          court_points: number
          created_at: string
          defense_points: number
          id: string
          notes: string | null
          session_id: string
          verdict: Database["public"]["Enums"]["trial_side"]
        }
        Insert: {
          accusation_points?: number
          case_id: string
          court_points?: number
          created_at?: string
          defense_points?: number
          id?: string
          notes?: string | null
          session_id: string
          verdict: Database["public"]["Enums"]["trial_side"]
        }
        Update: {
          accusation_points?: number
          case_id?: string
          court_points?: number
          created_at?: string
          defense_points?: number
          id?: string
          notes?: string | null
          session_id?: string
          verdict?: Database["public"]["Enums"]["trial_side"]
        }
        Relationships: [
          {
            foreignKeyName: "case_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "trial_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          algorithm_description: string
          algorithm_justification: string | null
          algorithm_title: string
          central_question: string
          code: string
          created_at: string
          description: string
          difficulty: number
          id: string
          is_final: boolean
          number: number
          points: number
          reveal_justification: boolean
          sort_order: number
          status: Database["public"]["Enums"]["case_status"]
          subtitle: string | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          algorithm_description: string
          algorithm_justification?: string | null
          algorithm_title: string
          central_question: string
          code: string
          created_at?: string
          description: string
          difficulty?: number
          id?: string
          is_final?: boolean
          number: number
          points?: number
          reveal_justification?: boolean
          sort_order?: number
          status?: Database["public"]["Enums"]["case_status"]
          subtitle?: string | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          algorithm_description?: string
          algorithm_justification?: string | null
          algorithm_title?: string
          central_question?: string
          code?: string
          created_at?: string
          description?: string
          difficulty?: number
          id?: string
          is_final?: boolean
          number?: number
          points?: number
          reveal_justification?: boolean
          sort_order?: number
          status?: Database["public"]["Enums"]["case_status"]
          subtitle?: string | null
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      evidence: {
        Row: {
          case_id: string
          category: Database["public"]["Enums"]["evidence_category"]
          created_at: string
          description: string
          document_path: string | null
          id: string
          image_path: string | null
          importance: Database["public"]["Enums"]["evidence_importance"] | null
          number: number
          reveal_phase: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          case_id: string
          category?: Database["public"]["Enums"]["evidence_category"]
          created_at?: string
          description: string
          document_path?: string | null
          id?: string
          image_path?: string | null
          importance?: Database["public"]["Enums"]["evidence_importance"] | null
          number: number
          reveal_phase?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          category?: Database["public"]["Enums"]["evidence_category"]
          created_at?: string
          description?: string
          document_path?: string | null
          id?: string
          image_path?: string | null
          importance?: Database["public"]["Enums"]["evidence_importance"] | null
          number?: number
          reveal_phase?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_cards: {
        Row: {
          auto_reveal: boolean
          case_id: string
          content: string
          created_at: string
          id: string
          reliability: Database["public"]["Enums"]["evidence_reliability"]
          sort_order: number
          source: string
          title: string
          type: Database["public"]["Enums"]["evidence_category"]
          updated_at: string
          witness_id: string | null
        }
        Insert: {
          auto_reveal?: boolean
          case_id: string
          content: string
          created_at?: string
          id?: string
          reliability?: Database["public"]["Enums"]["evidence_reliability"]
          sort_order?: number
          source: string
          title: string
          type?: Database["public"]["Enums"]["evidence_category"]
          updated_at?: string
          witness_id?: string | null
        }
        Update: {
          auto_reveal?: boolean
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          reliability?: Database["public"]["Enums"]["evidence_reliability"]
          sort_order?: number
          source?: string
          title?: string
          type?: Database["public"]["Enums"]["evidence_category"]
          updated_at?: string
          witness_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_cards_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_cards_witness_id_fkey"
            columns: ["witness_id"]
            isOneToOne: false
            referencedRelation: "witnesses"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_data: {
        Row: {
          case_id: string
          created_at: string
          decision_time: number | null
          location: string | null
          passengers: number | null
          pedestrians: number | null
          survival_probability: number | null
          updated_at: string
          vehicle_speed: number | null
          visibility: string | null
          weather: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          decision_time?: number | null
          location?: string | null
          passengers?: number | null
          pedestrians?: number | null
          survival_probability?: number | null
          updated_at?: string
          vehicle_speed?: number | null
          visibility?: string | null
          weather?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          decision_time?: number | null
          location?: string | null
          passengers?: number | null
          pedestrians?: number | null
          survival_probability?: number | null
          updated_at?: string
          vehicle_speed?: number | null
          visibility?: string | null
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_data_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      presenter_notes: {
        Row: {
          case_id: string
          created_at: string
          evidence_card_id: string | null
          evidence_id: string | null
          id: string
          note: string
          updated_at: string
          witness_id: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          evidence_card_id?: string | null
          evidence_id?: string | null
          id?: string
          note: string
          updated_at?: string
          witness_id?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          evidence_card_id?: string | null
          evidence_id?: string | null
          id?: string
          note?: string
          updated_at?: string
          witness_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presenter_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presenter_notes_evidence_card_id_fkey"
            columns: ["evidence_card_id"]
            isOneToOne: false
            referencedRelation: "evidence_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presenter_notes_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presenter_notes_witness_id_fkey"
            columns: ["witness_id"]
            isOneToOne: false
            referencedRelation: "witnesses"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_sessions: {
        Row: {
          accusation_score: number
          case_id: string | null
          completed_at: string | null
          court_score: number
          created_at: string
          current_phase: string
          defense_score: number
          id: string
          phase_index: number
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        Insert: {
          accusation_score?: number
          case_id?: string | null
          completed_at?: string | null
          court_score?: number
          created_at?: string
          current_phase?: string
          defense_score?: number
          id?: string
          phase_index?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Update: {
          accusation_score?: number
          case_id?: string | null
          completed_at?: string | null
          court_score?: number
          created_at?: string
          current_phase?: string
          defense_score?: number
          id?: string
          phase_index?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_sessions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      witnesses: {
        Row: {
          case_id: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          mediator_intro: string | null
          name: string
          number: number
          role: string
          sort_order: number
          updated_at: string
          video_path: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          mediator_intro?: string | null
          name: string
          number: number
          role: string
          sort_order?: number
          updated_at?: string
          video_path?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          mediator_intro?: string | null
          name?: string
          number?: number
          role?: string
          sort_order?: number
          updated_at?: string
          video_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "witnesses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      case_status: "draft" | "published"
      evidence_category:
        | "sensor"
        | "testimony"
        | "document"
        | "system_data"
        | "legislation"
        | "record"
        | "statement"
        | "photograph"
        | "vehicle_log"
        | "other"
      evidence_importance: "low" | "medium" | "high"
      evidence_reliability: "unknown" | "low" | "medium" | "high"
      session_status: "preparing" | "active" | "paused" | "completed"
      trial_side: "accusation" | "defense" | "court"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      case_status: ["draft", "published"],
      evidence_category: [
        "sensor",
        "testimony",
        "document",
        "system_data",
        "legislation",
        "record",
        "statement",
        "photograph",
        "vehicle_log",
        "other",
      ],
      evidence_importance: ["low", "medium", "high"],
      evidence_reliability: ["unknown", "low", "medium", "high"],
      session_status: ["preparing", "active", "paused", "completed"],
      trial_side: ["accusation", "defense", "court"],
    },
  },
} as const
