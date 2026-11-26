-- ============================================================
-- AURORA MOM & BABY SPA — SUPABASE DATABASE SCHEMA
-- Aman dijalankan ulang (Idempotent) di Supabase SQL Editor
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TREATMENTS TABLE
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_code TEXT UNIQUE NOT NULL,
    mom_name TEXT NOT NULL,
    child_name TEXT NOT NULL,
    child_age TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    guest_category TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pastikan kolom notes tersedia pada database yang sudah ada
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- 4. INDEXES (Optimal untuk filter rentang tanggal, kategori tamu, dan status)
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations (reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_datetime ON public.reservations (reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_date_category ON public.reservations (reservation_date, guest_category);
CREATE INDEX IF NOT EXISTS idx_reservations_date_status ON public.reservations (reservation_date, status);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_category ON public.reservations (guest_category);
CREATE INDEX IF NOT EXISTS idx_reservations_treatment_id ON public.reservations (treatment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_mom_name ON public.reservations (mom_name);
CREATE INDEX IF NOT EXISTS idx_reservations_whatsapp ON public.reservations (whatsapp);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read treatments" ON public.treatments;
    DROP POLICY IF EXISTS "Allow public insert treatments" ON public.treatments;
    DROP POLICY IF EXISTS "Allow public update treatments" ON public.treatments;
    DROP POLICY IF EXISTS "Allow public delete treatments" ON public.treatments;
END $$;

CREATE POLICY "Allow public read treatments" ON public.treatments
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert treatments" ON public.treatments
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update treatments" ON public.treatments
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete treatments" ON public.treatments
    FOR DELETE TO anon, authenticated USING (true);

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read reservations" ON public.reservations;
    DROP POLICY IF EXISTS "Allow public insert reservations" ON public.reservations;
    DROP POLICY IF EXISTS "Allow public update reservations" ON public.reservations;
    DROP POLICY IF EXISTS "Allow public delete reservations" ON public.reservations;
END $$;

CREATE POLICY "Allow public read reservations" ON public.reservations
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert reservations" ON public.reservations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update reservations" ON public.reservations
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete reservations" ON public.reservations
    FOR DELETE TO anon, authenticated USING (true);

-- 6. ENABLE REALTIME PUBLICATION
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Publication sudah terdaftar
END $$;

-- 7. OPTIONAL HELPER FUNCTION: Ringkasan Kategori Tamu per Rentang Tanggal
CREATE OR REPLACE FUNCTION public.get_reservation_summary(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_count BIGINT,
    trial_count BIGINT,
    pelanggan_count BIGINT,
    influencer_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        COUNT(*)::BIGINT AS total_count,
        COUNT(*) FILTER (WHERE guest_category = 'Trial')::BIGINT AS trial_count,
        COUNT(*) FILTER (WHERE guest_category = 'Pelanggan')::BIGINT AS pelanggan_count,
        COUNT(*) FILTER (WHERE guest_category = 'Influencer')::BIGINT AS influencer_count
    FROM public.reservations
    WHERE (p_start_date IS NULL OR reservation_date >= p_start_date)
      AND (p_end_date IS NULL OR reservation_date <= p_end_date);
$$;

GRANT EXECUTE ON FUNCTION public.get_reservation_summary(DATE, DATE) TO anon, authenticated;

-- 8. INITIAL TREATMENTS DATA (Opsional, tidak menimpa data yang sudah ada)
INSERT INTO public.treatments (id, name, is_active)
VALUES
    ('c56a4180-65aa-42ec-a945-5fd21dec0538', 'Couple Massage Mom & Kids', true),
    ('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'Baby Spa & Massage', true),
    ('1024045b-6f59-4b2a-9e3f-677a83d73b06', 'Mom Postpartum Massage', true),
    ('e14251dc-b12e-4bca-876a-73d8e578491c', 'Baby Hydrotherapy', true),
    ('fd62bf8a-6b21-4d32-9cb8-4db81d68be0b', 'Kids Bubble Bath & Massage', true)
ON CONFLICT (id) DO NOTHING;
