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
    guest_source TEXT DEFAULT '',
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pastikan kolom notes dan guest_source tersedia pada database yang sudah ada (data lama boleh kosong)
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS guest_source TEXT DEFAULT '';
ALTER TABLE public.reservations ALTER COLUMN guest_source DROP NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN guest_source SET DEFAULT '';

-- 4. JEMBOL RECORDS TABLE (Visit Aja, Trial Treatment, & Ambil Voucher)
CREATE TABLE IF NOT EXISTS public.jembol_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jembol_type TEXT NOT NULL DEFAULT 'Visit Aja' CHECK (jembol_type IN ('Visit Aja', 'Trial Treatment', 'Ambil Voucher')),
    tanggal DATE,
    nama TEXT NOT NULL DEFAULT '',
    no_hp TEXT NOT NULL DEFAULT '',
    alamat TEXT NOT NULL DEFAULT '',
    treatment TEXT NOT NULL DEFAULT '',
    kesan_pesan TEXT NOT NULL DEFAULT '',
    tau_dari_mana TEXT NOT NULL DEFAULT '',
    keterangan TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jembol_records DROP CONSTRAINT IF EXISTS jembol_records_jembol_type_check;
ALTER TABLE public.jembol_records ADD CONSTRAINT jembol_records_jembol_type_check CHECK (jembol_type IN ('Visit Aja', 'Trial Treatment', 'Ambil Voucher'));

-- 5. VISIT RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.visit_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE,
    nama TEXT NOT NULL DEFAULT '',
    no_hp TEXT NOT NULL DEFAULT '',
    alamat TEXT NOT NULL DEFAULT '',
    treatment TEXT NOT NULL DEFAULT '',
    kesan_pesan TEXT NOT NULL DEFAULT '',
    tau_dari_mana TEXT NOT NULL DEFAULT '',
    keterangan TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. INDEXES (Optimal untuk filter rentang tanggal, kategori tamu, status, jembol, dan visit)
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations (reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_datetime ON public.reservations (reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_date_category ON public.reservations (reservation_date, guest_category);
CREATE INDEX IF NOT EXISTS idx_reservations_date_status ON public.reservations (reservation_date, status);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_category ON public.reservations (guest_category);
CREATE INDEX IF NOT EXISTS idx_reservations_treatment_id ON public.reservations (treatment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_mom_name ON public.reservations (mom_name);
CREATE INDEX IF NOT EXISTS idx_reservations_whatsapp ON public.reservations (whatsapp);

CREATE INDEX IF NOT EXISTS idx_jembol_tanggal ON public.jembol_records (tanggal);
CREATE INDEX IF NOT EXISTS idx_jembol_type ON public.jembol_records (jembol_type);
CREATE INDEX IF NOT EXISTS idx_jembol_created_at ON public.jembol_records (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visit_tanggal ON public.visit_records (tanggal);
CREATE INDEX IF NOT EXISTS idx_visit_created_at ON public.visit_records (created_at DESC);

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jembol_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_records ENABLE ROW LEVEL SECURITY;

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

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read jembol_records" ON public.jembol_records;
    DROP POLICY IF EXISTS "Allow public insert jembol_records" ON public.jembol_records;
    DROP POLICY IF EXISTS "Allow public update jembol_records" ON public.jembol_records;
    DROP POLICY IF EXISTS "Allow public delete jembol_records" ON public.jembol_records;
END $$;

CREATE POLICY "Allow public read jembol_records" ON public.jembol_records
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert jembol_records" ON public.jembol_records
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update jembol_records" ON public.jembol_records
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete jembol_records" ON public.jembol_records
    FOR DELETE TO anon, authenticated USING (true);

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read visit_records" ON public.visit_records;
    DROP POLICY IF EXISTS "Allow public insert visit_records" ON public.visit_records;
    DROP POLICY IF EXISTS "Allow public update visit_records" ON public.visit_records;
    DROP POLICY IF EXISTS "Allow public delete visit_records" ON public.visit_records;
END $$;

CREATE POLICY "Allow public read visit_records" ON public.visit_records
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert visit_records" ON public.visit_records
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update visit_records" ON public.visit_records
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete visit_records" ON public.visit_records
    FOR DELETE TO anon, authenticated USING (true);

-- 8. ENABLE REALTIME PUBLICATION
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jembol_records;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.visit_records;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 9. OPTIONAL HELPER FUNCTION: Ringkasan Kategori Tamu per Rentang Tanggal
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

-- 10. INITIAL TREATMENTS DATA (Opsional, tidak menimpa data yang sudah ada)
INSERT INTO public.treatments (id, name, is_active)
VALUES
    ('c56a4180-65aa-42ec-a945-5fd21dec0538', 'Couple Massage Mom & Kids', true),
    ('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'Baby Spa & Massage', true),
    ('1024045b-6f59-4b2a-9e3f-677a83d73b06', 'Mom Postpartum Massage', true),
    ('e14251dc-b12e-4bca-876a-73d8e578491c', 'Baby Hydrotherapy', true),
    ('fd62bf8a-6b21-4d32-9cb8-4db81d68be0b', 'Kids Bubble Bath & Massage', true)
ON CONFLICT (id) DO NOTHING;
