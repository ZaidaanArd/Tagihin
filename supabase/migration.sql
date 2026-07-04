-- ============================================================
-- Tagihin — Database Migration
-- Generate all tables + RLS policies for Supabase
-- ============================================================

-- ------------------------
-- ENUM Types
-- ------------------------
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');
CREATE TYPE tax_type AS ENUM ('none', 'pph21', 'pph23', 'ppn');

-- ------------------------
-- Table: users
-- ------------------------
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  business_name TEXT,
  npwp        TEXT,
  address     TEXT,
  phone       TEXT,
  bank_name   TEXT,
  bank_account TEXT,
  bank_holder  TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read/update only their own row
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------
-- Table: clients
-- ------------------------
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  npwp        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------
-- Table: invoices
-- ------------------------
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number  TEXT NOT NULL,
  status          invoice_status NOT NULL DEFAULT 'draft',
  issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE NOT NULL,
  notes           TEXT,
  tax_type        tax_type NOT NULL DEFAULT 'none',
  tax_rate        DECIMAL(5,2) NOT NULL DEFAULT 0,
  subtotal        DECIMAL(15,0) NOT NULL DEFAULT 0,
  tax_amount      DECIMAL(15,0) NOT NULL DEFAULT 0,
  total           DECIMAL(15,0) NOT NULL DEFAULT 0,
  public_token    UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_public_token ON invoices(public_token);

-- Unique invoice number per user
CREATE UNIQUE INDEX idx_invoices_number_per_user ON invoices(user_id, invoice_number);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Public token access (no auth required)
CREATE POLICY "Public can read invoice by token"
  ON invoices FOR SELECT
  USING (true);

-- ------------------------
-- Table: invoice_items
-- ------------------------
CREATE TABLE invoice_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    DECIMAL(12,2) NOT NULL DEFAULT 1,
  unit        TEXT,
  unit_price  DECIMAL(15,0) NOT NULL DEFAULT 0,
  amount      DECIMAL(15,0) NOT NULL DEFAULT 0
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- invoice_items inherit access via the parent invoice
CREATE POLICY "Users can read own invoice items"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice items"
  ON invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items"
  ON invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items"
  ON invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Public can read items of publicly accessible invoices
CREATE POLICY "Public can read invoice items by token"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
    )
  );

-- ------------------------
-- Helper: invoice number sequence per user per year
-- ------------------------
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;

CREATE OR REPLACE FUNCTION generate_invoice_number(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_year TEXT;
  v_seq  INT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COALESCE(MAX(seq), 0) + 1 INTO v_seq
  FROM (
    SELECT SPLIT_PART(invoice_number, '/', 3)::INT AS seq
    FROM invoices
    WHERE user_id = p_user_id
      AND invoice_number LIKE 'INV/' || v_year || '/%'
  ) sub;

  RETURN 'INV/' || v_year || '/' || LPAD(v_seq::TEXT, 3, '0');
END;
$$;
