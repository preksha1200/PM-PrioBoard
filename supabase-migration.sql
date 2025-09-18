-- PM PrioBoard Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security on auth.users (should already be enabled)
-- This ensures users can only access their own data

-- Create product_profiles table
CREATE TABLE IF NOT EXISTS product_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    one_liner TEXT,
    detailed_description TEXT,
    north_star_metric JSONB,
    secondary_kpis JSONB,
    audience_scale JSONB,
    business_context JSONB,
    funnel_channels JSONB,
    baseline_volumes JSONB,
    team_effort_units JSONB,
    custom_impact_ladder JSONB,
    confidence_rubric JSONB,
    constraints_risk JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_profile_id UUID REFERENCES product_profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    notes TEXT,
    reach NUMERIC,
    impact NUMERIC NOT NULL,
    confidence NUMERIC NOT NULL,
    effort NUMERIC NOT NULL,
    score NUMERIC NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE product_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_profiles
-- Users can only see their own product profiles
CREATE POLICY "Users can view own product profiles" ON product_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own product profiles
CREATE POLICY "Users can insert own product profiles" ON product_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own product profiles
CREATE POLICY "Users can update own product profiles" ON product_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own product profiles
CREATE POLICY "Users can delete own product profiles" ON product_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ideas
-- Users can only see their own ideas
CREATE POLICY "Users can view own ideas" ON ideas
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own ideas
CREATE POLICY "Users can insert own ideas" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own ideas
CREATE POLICY "Users can update own ideas" ON ideas
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own ideas
CREATE POLICY "Users can delete own ideas" ON ideas
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_profiles_user_id ON product_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_product_profile_id ON ideas(product_profile_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_product_profiles_updated_at 
    BEFORE UPDATE ON product_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at 
    BEFORE UPDATE ON ideas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (these should be automatic with RLS, but just to be sure)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON product_profiles TO authenticated;
GRANT ALL ON ideas TO authenticated;
