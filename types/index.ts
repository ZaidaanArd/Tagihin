export type User = {
  id: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  npwp: string | null;
  address: string | null;
  phone: string | null;
  bank_name: string | null;
  bank_account: string | null;
  bank_holder: string | null;
  logo_url: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  npwp: string | null;
  created_at: string;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type TaxType = "none" | "pph21" | "pph23" | "ppn";

export type Invoice = {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  notes: string | null;
  tax_type: TaxType;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  public_token: string;
  created_at: string;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  amount: number;
};

export type InvoiceWithItems = Invoice & { items: InvoiceItem[]; client: Client };
