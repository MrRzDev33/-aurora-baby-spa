-- ============================================================
-- AURORA MOM & BABY SPA — SUPABASE DATABASE SCHEMA
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations (reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_datetime ON public.reservations (reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_category ON public.reservations (guest_category);
CREATE INDEX IF NOT EXISTS idx_reservations_treatment_id ON public.reservations (treatment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_mom_name ON public.reservations (mom_name);
CREATE INDEX IF NOT EXISTS idx_reservations_whatsapp ON public.reservations (whatsapp);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Treatments policies (Full CRUD for admin application)
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

-- Reservations policies (Full CRUD for admin application)
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
    NULL; -- Publication might already have the table
END $$;

-- 7. INITIAL TREATMENTS DATA
INSERT INTO public.treatments (id, name, is_active)
VALUES
    ('c56a4180-65aa-42ec-a945-5fd21dec0538', 'Couple Massage Mom & Kids', true),
    ('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'Baby Spa & Massage', true),
    ('1024045b-6f59-4b2a-9e3f-677a83d73b06', 'Mom Postpartum Massage', true),
    ('e14251dc-b12e-4bca-876a-73d8e578491c', 'Baby Hydrotherapy', true),
    ('fd62bf8a-6b21-4d32-9cb8-4db81d68be0b', 'Kids Bubble Bath & Massage', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active;

-- 8. INITIAL RESERVATIONS DATA
INSERT INTO public.reservations (
    id,
    reservation_code,
    mom_name,
    child_name,
    child_age,
    whatsapp,
    guest_category,
    reservation_date,
    reservation_time,
    treatment_id,
    status
)
VALUES
    -- Kachi (Required Initial Dummy on 9 October 2026)
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'RES-20261009-001', 'Kachi', 'Kiran dan Kinar', '4+ months', '+62812-9744-3286', 'Trial', '2026-10-09', '14:00', 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'Confirmed'),
    
    -- Additional dummy on 9 October 2026 (shows 3 reservations)
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'RES-20261009-002', 'Sarah', 'Baby El', '6 months', '+62813-8822-1920', 'Pelanggan', '2026-10-09', '15:00', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'Confirmed'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'RES-20261009-003', 'Alya', 'Baby Kenzo', '8 months', '+62811-2345-6789', 'Influencer', '2026-10-09', '16:30', '1024045b-6f59-4b2a-9e3f-677a83d73b06', 'Confirmed'),

    -- Today's reservations (2026-10-02)
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'RES-20261002-001', 'Amanda', 'Baby Sean', '5 months', '+62817-5555-8910', 'Pelanggan', '2026-10-02', '10:00', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'Completed'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'RES-20261002-002', 'Nabila', 'Arka', '1 year', '+62819-0123-4567', 'Trial', '2026-10-02', '13:30', 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'In Treatment'),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'RES-20261002-003', 'Jessica', 'Baby Chloe', '3 months', '+62852-7711-2233', 'Pelanggan', '2026-10-02', '15:00', 'e14251dc-b12e-4bca-876a-73d8e578491c', 'Confirmed'),
    ('01eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'RES-20261002-004', 'Rania', 'Mika & Alif', '2 years & 4 years', '+62812-4433-2211', 'Pelanggan', '2026-10-02', '16:30', 'fd62bf8a-6b21-4d32-9cb8-4db81d68be0b', 'Pending')
ON CONFLICT (id) DO NOTHING;
