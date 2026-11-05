export type CustomerStatus = "active" | "archived";
export type EmployeeStatus = "active" | "archived";
export type ProductStatus = "draft" | "active" | "archived" | "out_of_stock";
export type SaleStatus = "pending" | "completed" | "cancelled";
export type UserRole =
  | "superadmin"
  | "admin"
  | "hr_manager"
  | "sales_rep"
  | "crm_agent"
  | "product_manager"
  | "employee";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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

export type ProductRow = {
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

type DepartmentRow = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type EmployeeRow = {
  id: string;
  profile_id: string | null;
  department_id: string | null;
  employee_code: string | null;
  job_title: string;
  employment_type: "full_time" | "part_time" | "contractor" | "intern";
  employment_status: "active" | "on_leave" | "terminated" | "suspended";
  hire_date: string;
  salary: number | null;
  manager_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
};

export type SaleRow = {
  id: string;
  customer_id: string;
  total_amount: number;
  status: SaleStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type SaleItemRow = {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
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
      departments: {
        Row: DepartmentRow;
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<DepartmentRow>;
        Relationships: [];
      };
      employees: {
        Row: EmployeeRow;
        Insert: {
          id?: string;
          profile_id?: string | null;
          department_id: string;
          employee_code?: string | null;
          job_title: string;
          employment_type?: EmployeeRow["employment_type"];
          employment_status?: EmployeeRow["employment_status"];
          hire_date: string;
          salary?: number | null;
          manager_id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          position: string;
          status?: EmployeeStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<EmployeeRow>;
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
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
      sales: {
        Row: SaleRow;
        Insert: {
          id?: string;
          customer_id: string;
          total_amount?: number;
          status?: SaleStatus;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<SaleRow>;
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      sale_items: {
        Row: SaleItemRow;
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Update: Partial<SaleItemRow>;
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_hr_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_customer_manager: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_sales_manager: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_product_manager: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_sale_transaction: {
        Args: {
          p_customer_id: string;
          p_items: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      product_status: ProductStatus;
      user_role: UserRole;
      employment_type: EmployeeRow["employment_type"];
      employment_status: EmployeeRow["employment_status"];
      attendance_status: "present" | "absent" | "late" | "half_day" | "excused";
      leave_type:
        | "annual"
        | "sick"
        | "maternity"
        | "paternity"
        | "unpaid"
        | "bereavement";
      leave_status: "pending" | "approved" | "rejected" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};
