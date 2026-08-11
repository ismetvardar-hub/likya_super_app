-- ============================================================================
-- LİKYA SUPER-APP: INITIAL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) MIGRATION
-- File: supabase/migrations/20260810_init_schema.sql
-- Date: 2026-08-10
-- Description: Core tables (users, fair_products, events, tickets, repair_donations)
--              with comprehensive RLS policies, indexes, and triggers.
-- ============================================================================

-- 1. EXTENSIONS & UTILITY FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Automatic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic public.users profile creation function on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 2. TABLE DEFINITIONS
-- ============================================================================

-- 2.1 USERS TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'organizer', 'repairer', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 FAIR_PRODUCTS TABLE (Adil Ticaret Ürünleri)
CREATE TABLE IF NOT EXISTS public.fair_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 EVENTS TABLE (Yerel Etkinlikler & Etkinlik Takvimi)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    available_capacity INTEGER NOT NULL CHECK (available_capacity >= 0),
    ticket_price NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (ticket_price >= 0),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_event_dates CHECK (end_time > start_time),
    CONSTRAINT capacity_check CHECK (available_capacity <= total_capacity)
);

-- 2.4 TICKETS TABLE (Biletleme & QR Kodlar)
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled')),
    qr_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 REPAIR_DONATIONS TABLE (Onarım & Bağış Takip Sistemi)
CREATE TABLE IF NOT EXISTS public.repair_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    repair_status TEXT NOT NULL DEFAULT 'pending' CHECK (repair_status IN ('pending', 'in_repair', 'repaired', 'donated', 'recycled')),
    donation_amount NUMERIC(10,2) DEFAULT 0.00 CHECK (donation_amount >= 0),
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_fair_products_seller ON public.fair_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_fair_products_status ON public.fair_products(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON public.tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_repair_donations_donor ON public.repair_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_repair_donations_status ON public.repair_donations(repair_status);


-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- Trigger for auth.users signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at timestamps
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_fair_products_updated_at
    BEFORE UPDATE ON public.fair_products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_repair_donations_updated_at
    BEFORE UPDATE ON public.repair_donations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fair_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_donations ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------------------------
-- 5.1 RLS POLICIES FOR 'users'
-- ----------------------------------------------------------------------------
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT
    USING (
        auth.uid() = id 
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE
    USING (
        auth.uid() = id 
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "users_delete_policy" ON public.users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ----------------------------------------------------------------------------
-- 5.2 RLS POLICIES FOR 'fair_products'
-- ----------------------------------------------------------------------------
CREATE POLICY "fair_products_select_policy" ON public.fair_products
    FOR SELECT
    USING (
        status = 'active'
        OR auth.uid() = seller_id
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "fair_products_insert_policy" ON public.fair_products
    FOR INSERT
    WITH CHECK (
        auth.uid() = seller_id
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('seller', 'admin')
        )
    );

CREATE POLICY "fair_products_update_policy" ON public.fair_products
    FOR UPDATE
    USING (
        auth.uid() = seller_id
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "fair_products_delete_policy" ON public.fair_products
    FOR DELETE
    USING (
        auth.uid() = seller_id
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ----------------------------------------------------------------------------
-- 5.3 RLS POLICIES FOR 'events'
-- ----------------------------------------------------------------------------
CREATE POLICY "events_select_policy" ON public.events
    FOR SELECT
    USING (
        status = 'published'
        OR auth.uid() = organizer_id
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "events_insert_policy" ON public.events
    FOR INSERT
    WITH CHECK (
        auth.uid() = organizer_id
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('organizer', 'admin')
        )
    );

CREATE POLICY "events_update_policy" ON public.events
    FOR UPDATE
    USING (
        auth.uid() = organizer_id
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "events_delete_policy" ON public.events
    FOR DELETE
    USING (
        auth.uid() = organizer_id
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ----------------------------------------------------------------------------
-- 5.4 RLS POLICIES FOR 'tickets'
-- ----------------------------------------------------------------------------
CREATE POLICY "tickets_select_policy" ON public.tickets
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND organizer_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "tickets_insert_policy" ON public.tickets
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "tickets_update_policy" ON public.tickets
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND organizer_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "tickets_delete_policy" ON public.tickets
    FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ----------------------------------------------------------------------------
-- 5.5 RLS POLICIES FOR 'repair_donations'
-- ----------------------------------------------------------------------------
CREATE POLICY "repair_donations_select_policy" ON public.repair_donations
    FOR SELECT
    USING (
        auth.uid() = donor_id
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('repairer', 'admin')
        )
    );

CREATE POLICY "repair_donations_insert_policy" ON public.repair_donations
    FOR INSERT
    WITH CHECK (
        auth.uid() = donor_id
    );

CREATE POLICY "repair_donations_update_policy" ON public.repair_donations
    FOR UPDATE
    USING (
        auth.uid() = donor_id
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('repairer', 'admin')
        )
    );

CREATE POLICY "repair_donations_delete_policy" ON public.repair_donations
    FOR DELETE
    USING (
        (auth.uid() = donor_id AND repair_status = 'pending')
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
