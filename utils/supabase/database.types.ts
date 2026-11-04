export type ProductStatus = "draft" | "active" | "archived" | "out_of_stock";
export type UserRole =
  | "superadmin"
  | "admin"
  | "hr_manager"
  | "sales_rep"
  | "crm_agent"
  | "product_manager"
  | "employee";

type ProductRow = {
  id: string;
  category_id: string | null;
  sku: string;
  name: string;
  description: string | null;
  unit_price: number;
  cost_price: number | null;
  status: ProductStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

type ProductInventoryRow = {
  id: string;
  product_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  warehouse_location: string | null;
  last_restocked_at: string | null;
  created_at: string;
  updated_at: string;
};

type ProductInventoryInsert = {
  id?: string;
  product_id: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  warehouse_location?: string | null;
  last_restocked_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: Omit<ProductRow, "id" | "created_at" | "updated_at"> &
          Partial<Pick<ProductRow, "id" | "created_at" | "updated_at">>;
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      product_inventory: {
        Row: ProductInventoryRow;
        Insert: ProductInventoryInsert;
        Update: Partial<ProductInventoryRow>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_product_manager: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      product_status: ProductStatus;
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
