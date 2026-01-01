-- =====================================================
-- FnB Cost Calculator - Supabase Database Schema
-- Migration 001: Initial Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: ingredients
-- Αποθήκευση υλικών με τιμές και πληροφορίες
-- =====================================================
CREATE TABLE ingredients (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    price DECIMAL(10, 4) NOT NULL,
    supplier TEXT,
    waste_percent DECIMAL(5, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index για γρήγορη αναζήτηση ανά user
CREATE INDEX idx_ingredients_user_id ON ingredients(user_id);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_name ON ingredients(name);

-- RLS για ingredients
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ingredients" ON ingredients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ingredients" ON ingredients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ingredients" ON ingredients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredients" ON ingredients
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: recipes
-- Συνταγές με βασικές πληροφορίες
-- =====================================================
CREATE TABLE recipes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    servings DECIMAL(10, 2) NOT NULL DEFAULT 1,
    prep_time_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: recipe_ingredients
-- Υλικά που περιέχονται σε κάθε συνταγή
-- =====================================================
CREATE TABLE recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit TEXT NOT NULL
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Για recipe_ingredients, check μέσω recipe ownership
CREATE POLICY "Users can view recipe ingredients via recipe" ON recipe_ingredients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recipes 
            WHERE recipes.id = recipe_ingredients.recipe_id 
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create recipe ingredients via recipe" ON recipe_ingredients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM recipes 
            WHERE recipes.id = recipe_ingredients.recipe_id 
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update recipe ingredients via recipe" ON recipe_ingredients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM recipes 
            WHERE recipes.id = recipe_ingredients.recipe_id 
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete recipe ingredients via recipe" ON recipe_ingredients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM recipes 
            WHERE recipes.id = recipe_ingredients.recipe_id 
            AND recipes.user_id = auth.uid()
        )
    );

-- =====================================================
-- TABLE: events
-- Catering events / εκδηλώσεις
-- =====================================================
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    event_date DATE,
    event_location TEXT,
    guests INTEGER DEFAULT 0,
    pricing_mode TEXT DEFAULT 'per_person' CHECK (pricing_mode IN ('per_person', 'per_event')),
    staff_count INTEGER DEFAULT 0,
    staff_hours DECIMAL(10, 2) DEFAULT 0,
    include_staff_in_price BOOLEAN DEFAULT FALSE,
    transport_km DECIMAL(10, 2) DEFAULT 0,
    equipment_cost DECIMAL(10, 2) DEFAULT 0,
    equipment_notes TEXT,
    notes TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'quote_sent', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events" ON events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON events
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: event_recipes
-- Συνταγές που περιλαμβάνονται σε κάθε event
-- =====================================================
CREATE TABLE event_recipes (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
    servings DECIMAL(10, 2) NOT NULL,
    price_override DECIMAL(10, 2)
);

CREATE INDEX idx_event_recipes_event ON event_recipes(event_id);
CREATE INDEX idx_event_recipes_recipe ON event_recipes(recipe_id);

ALTER TABLE event_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event recipes via event" ON event_recipes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_recipes.event_id 
            AND events.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create event recipes via event" ON event_recipes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_recipes.event_id 
            AND events.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update event recipes via event" ON event_recipes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_recipes.event_id 
            AND events.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete event recipes via event" ON event_recipes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_recipes.event_id 
            AND events.user_id = auth.uid()
        )
    );

-- =====================================================
-- TABLE: settings
-- Ρυθμίσεις χρήστη (ένα row ανά user)
-- =====================================================
CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mode TEXT DEFAULT 'restaurant' CHECK (mode IN ('restaurant', 'catering', 'private_chef')),
    
    -- Common
    vat_rate DECIMAL(5, 2) DEFAULT 24,
    fixed_costs_json JSONB,
    
    -- Restaurant Mode
    labour_cost_per_hour DECIMAL(10, 2) DEFAULT 10,
    overhead_monthly DECIMAL(10, 2) DEFAULT 1000,
    portions_per_month DECIMAL(10, 2) DEFAULT 1000,
    packaging_per_portion DECIMAL(10, 2) DEFAULT 0.5,
    target_food_cost_percent DECIMAL(5, 2) DEFAULT 30,
    
    -- Catering Mode
    staff_rate_type TEXT DEFAULT 'hourly' CHECK (staff_rate_type IN ('hourly', 'daily')),
    staff_hourly_rate DECIMAL(10, 2) DEFAULT 10,
    staff_daily_rate DECIMAL(10, 2) DEFAULT 80,
    transport_cost_per_km DECIMAL(10, 2) DEFAULT 0.5,
    equipment_rental_default DECIMAL(10, 2) DEFAULT 0,
    disposables_per_person DECIMAL(10, 2) DEFAULT 1,
    catering_markup_percent DECIMAL(5, 2) DEFAULT 30,
    
    -- Private Chef Mode
    chef_rate_type TEXT DEFAULT 'hourly' CHECK (chef_rate_type IN ('hourly', 'daily')),
    chef_fee_per_hour DECIMAL(10, 2) DEFAULT 50,
    chef_daily_rate DECIMAL(10, 2) DEFAULT 300,
    assistant_rate_type TEXT DEFAULT 'hourly' CHECK (assistant_rate_type IN ('hourly', 'daily')),
    assistant_fee_per_hour DECIMAL(10, 2) DEFAULT 20,
    assistant_daily_rate DECIMAL(10, 2) DEFAULT 150,
    food_markup_percent DECIMAL(5, 2) DEFAULT 30,
    
    -- Company Info
    company_name TEXT,
    company_email TEXT,
    company_phone TEXT,
    company_address TEXT,
    company_vat_number TEXT,
    company_logo_url TEXT,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_user_id ON settings(user_id);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings" ON settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON settings
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: user_roles
-- Ρόλοι χρηστών (admin, super_admin)
-- =====================================================
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
        )
    );

-- Only super_admin can manage roles
CREATE POLICY "Super admins can manage roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'super_admin'
        )
    );

-- =====================================================
-- FUNCTIONS: Updated At Trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_ingredients_updated_at
    BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Check if user is admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = check_user_id 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Check if user is super admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = check_user_id 
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEW: Recipes with ingredients (για εύκολο fetch)
-- =====================================================
CREATE OR REPLACE VIEW recipes_with_ingredients AS
SELECT 
    r.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', ri.id,
                'ingredient_id', ri.ingredient_id,
                'quantity', ri.quantity,
                'unit', ri.unit,
                'ingredient_name', i.name,
                'ingredient_price', i.price,
                'ingredient_waste_percent', i.waste_percent
            )
        ) FILTER (WHERE ri.id IS NOT NULL),
        '[]'
    ) AS ingredients
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN ingredients i ON ri.ingredient_id = i.id
GROUP BY r.id;

-- =====================================================
-- VIEW: Events with recipes
-- =====================================================
CREATE OR REPLACE VIEW events_with_recipes AS
SELECT 
    e.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', er.id,
                'recipe_id', er.recipe_id,
                'servings', er.servings,
                'price_override', er.price_override,
                'recipe_name', r.name
            )
        ) FILTER (WHERE er.id IS NOT NULL),
        '[]'
    ) AS recipes
FROM events e
LEFT JOIN event_recipes er ON e.id = er.event_id
LEFT JOIN recipes r ON er.recipe_id = r.id
GROUP BY e.id;
