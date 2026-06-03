-- Create table for reservations
CREATE TABLE IF NOT EXISTS public.reservations (
  id text PRIMARY KEY,
  product_name text,
  sku text,
  size text,
  color text,
  qty integer,
  price integer,
  fullname text,
  phone text,
  email text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_sku ON public.reservations (sku);
