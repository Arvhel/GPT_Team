export type CustomerStatus = "active" | "archived";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: CustomerRow;
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          status?: CustomerStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CustomerRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_customer_manager: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};