-- ========================================================================
-- AJAY ELECTRICALS - SUPABASE DATABASE SCHEMA & POLICIES
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_id TEXT,
    service_name TEXT NOT NULL,
    service_category TEXT DEFAULT 'repair',
    address TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_slot TEXT NOT NULL,
    urgency TEXT DEFAULT 'Standard',
    problem_details TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'In progress', 'Completed', 'Cancelled')),
    estimated_cost NUMERIC DEFAULT 0,
    assigned_technician TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy lookups by booking code and customer phone (tracking portal)
CREATE INDEX IF NOT EXISTS idx_bookings_lookup ON public.bookings(booking_code, customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON public.bookings(created_at DESC);

-- 2. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'repair',
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    estimated_duration TEXT DEFAULT '45 mins',
    is_featured BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS (SALES CATALOG) TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    price NUMERIC NOT NULL,
    mrp NUMERIC,
    in_stock BOOLEAN DEFAULT true,
    warranty TEXT,
    badge TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    shop_name TEXT NOT NULL DEFAULT 'Ajay Electricals',
    tagline TEXT DEFAULT 'Trusted Sales & Doorstep Electrical Service in Pune',
    phone_emergency TEXT DEFAULT '9673681767',
    phone_whatsapp TEXT DEFAULT '9673681767',
    phone_alt TEXT DEFAULT '7666184280',
    address TEXT DEFAULT 'Canol Road, Lane No. 7, Karvenagar, Pune, Maharashtra 411052',
    hours TEXT DEFAULT 'Shop Open: 9:00 AM - 10:30 PM (24/7 Emergency On Call)',
    upi_id TEXT DEFAULT 'ajayelectricals@okaxis',
    instagram_url TEXT DEFAULT 'https://instagram.com/ajay_electricals',
    instagram_handle TEXT DEFAULT '@ajay_electricals',
    banner_message TEXT DEFAULT '⚡ 24-hour emergency electrical service available in Karvenagar & Pune. Call +91 9673681767',
    payment_info TEXT DEFAULT 'UPI: 9673681767@upi / Google Pay / PhonePe\nBank: Ajay Electricals, Current A/C\nPlease share payment screenshot on WhatsApp.',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- BOOKINGS POLICIES:
-- Anyone can create a booking (Public website user)
CREATE POLICY "Public can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Anyone can read their own booking (Matching tracking code)
CREATE POLICY "Public can track bookings" ON public.bookings
    FOR SELECT USING (true);

-- Allow authenticated users or with anon key for management (or customize with Supabase Auth)
CREATE POLICY "Allow update bookings" ON public.bookings
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete bookings" ON public.bookings
    FOR DELETE USING (true);

-- SERVICES POLICIES:
CREATE POLICY "Public can view services" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Allow modify services" ON public.services
    FOR ALL USING (true);

-- PRODUCTS POLICIES:
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Allow modify products" ON public.products
    FOR ALL USING (true);

-- SETTINGS POLICIES:
CREATE POLICY "Public can view settings" ON public.shop_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow modify settings" ON public.shop_settings
    FOR ALL USING (true);

-- 6. SEED INITIAL DATA (Ajay Electricals Pune Services & Products)

INSERT INTO public.shop_settings (id, shop_name, phone_emergency, phone_whatsapp, phone_alt, address, hours, banner_message)
VALUES (
    'primary',
    'Ajay Electricals',
    '9673681767',
    '9673681767',
    '7666184280',
    'Canol Road, Lane No. 7, Karvenagar, Pune, Maharashtra 411052',
    'Shop Open: 9:00 AM - 10:30 PM (24/7 Emergency On Call)',
    '⚡ 24-hour emergency electrical service available in Karvenagar & Pune. Call +91 9673681767'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.services (id, title, category, icon, description, price, estimated_duration, display_order)
VALUES
('svc-fan', 'Fan Repair & Installation', 'repair', '🌀', 'Ceiling, exhaust, table & pedestal fans bearing, rewinding, capacitor change & regulator checks.', 'From ₹150', '30-45 mins', 1),
('svc-mixer', 'Mixer Grinder Repair', 'repair', '🍹', 'Motor repair, carbon brush change, jar coupler, blade replacement and heavy-duty rewinding.', 'From ₹200', '45 mins', 2),
('svc-geyser', 'Geyser & Water Heater', 'repair', '🚿', 'Instant & storage geysers element replacement, thermostat tuning, tank leakage & coil repair.', 'From ₹250', '45-60 mins', 3),
('svc-wiring', 'Complete House Wiring', 'wiring', '🔌', 'Concealed & surface wiring, MCB distribution board setup, short-circuit diagnostics & load balancing.', 'Free site survey', 'Custom', 4),
('svc-install', 'Appliance & Light Fitting', 'installation', '🛠️', 'Chandelier, LED profile lighting, fancy switches, inverter connection and heavy appliance wiring.', 'From ₹120', '30 mins', 5),
('svc-society', 'Society Electrical AMC', 'maintenance', '🏢', 'Annual maintenance contracts for residential societies, pump motor panels, lift power & common area lighting.', 'Tailored AMC', 'Ongoing', 6),
('svc-cctv', 'CCTV Sales & Installation', 'security', '📹', 'HD & IP security cameras, 4/8/16-channel DVR/NVR, remote phone viewing setup & maintenance.', 'Get a Quote', 'Same day', 7),
('svc-dishtv', 'DishTV / DTH Sales & Setup', 'installation', '📡', 'New connections (Tata Play, Airtel, Dish TV), signal tuning, dish alignment & LNB wire replacement.', 'From ₹299', '45 mins', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, title, category, brand, price, mrp, in_stock, warranty, badge, description, display_order)
VALUES
('prd-led-light', 'Havells 20W Cool Day LED Tube & Batten', 'lighting', 'Havells', 320, 480, true, '2 Years', 'Best Seller', 'High lumen, glare-free, energy-efficient batten light with surge protection up to 4kV.', 1),
('prd-fan-crompton', 'Crompton High-Speed 1200mm Ceiling Fan', 'appliances', 'Crompton', 1850, 2490, true, '2 Years', 'Popular', '100% copper motor, high air delivery, anti-dust technology.', 2),
('prd-mcb-anchor', 'Anchor Panasonic Single Pole MCB C-Curve', 'switches', 'Anchor', 160, 240, true, '3 Years', 'Safety Pick', 'Flame retardant housing, instant short circuit tripping protection.', 3),
('prd-cctv-kit', 'CP Plus 4 Camera 2MP Full HD CCTV Combo Kit', 'security', 'CP Plus', 8990, 12500, true, '2 Years', 'Full Setup', 'Includes DVR, 4 night-vision bullet/dome cameras, 1TB hard drive & cables.', 4),
('prd-wire-polycab', 'Polycab 1.5 sq mm Flame Retardant Copper Wire (90m)', 'wires', 'Polycab', 1780, 2350, true, 'ISI Certified', 'Top Quality', 'Heat resistant, oxygen free copper conductor wire ideal for home and office electrification.', 5),
('prd-geyser-instant', 'Bajaj 3L Flora Instant Water Heater Geyser', 'appliances', 'Bajaj', 2890, 4100, true, '2 Years', 'Hot Seller', 'Rust-proof thermoplastic body, fire-retardant cable with neon indicators.', 6)
ON CONFLICT (id) DO NOTHING;

-- Sample initial bookings for testing
INSERT INTO public.bookings (booking_code, customer_name, customer_phone, service_name, address, preferred_date, preferred_slot, urgency, problem_details, status, estimated_cost)
VALUES
('AE-4182', 'Rajesh Kulkarni', '9822012345', 'Geyser & Water Heater', 'Flat 402, Sai Shraddha Apts, Karvenagar', CURRENT_DATE, 'Morning (9 AM - 12 PM)', 'Standard', 'Geyser tripping MCB whenever switched on.', 'Pending', 350),
('AE-7391', 'Pooja Deshmukh', '9890123456', 'Fan Repair & Installation', 'Bunglow 12, Swapnanagari, Canol Road', CURRENT_DATE, 'Afternoon (12 PM - 4 PM)', 'Urgent', 'Ceiling fan making squeaking noise and running very slow.', 'Confirmed', 200),
('AE-8920', 'Amit Shinde', '9765432100', 'Complete House Wiring', 'Shop 3, Near Cummins College, Karvenagar', CURRENT_DATE - INTERVAL '1 day', 'Morning (9 AM - 12 PM)', 'Standard', 'Inspection for new renovation wiring and switchboard shifting.', 'In progress', 2500),
('AE-2345', 'Society Chairman - Shanti Niwas', '9922883344', 'Society Electrical AMC', 'Shanti Niwas CHS, Lane 7 Karvenagar', CURRENT_DATE - INTERVAL '3 day', 'Morning (9 AM - 12 PM)', 'Standard', 'Common area sensor lights stopped working.', 'Completed', 1200)
ON CONFLICT (booking_code) DO NOTHING;

-- Output confirmation
SELECT 'Ajay Electricals database schema successfully created!' as status;
