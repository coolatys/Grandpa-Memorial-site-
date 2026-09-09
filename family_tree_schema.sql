CREATE TABLE IF NOT EXISTS public.family_tree_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    birth_year TEXT,
    death_year TEXT,
    photo_url TEXT,
    parent_id UUID REFERENCES public.family_tree_nodes(id),
    spouse_id UUID REFERENCES public.family_tree_nodes(id),
    gender TEXT
);

CREATE TABLE IF NOT EXISTS public.family_tree_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_node_id UUID REFERENCES public.family_tree_nodes(id),
    submitter_name TEXT NOT NULL,
    submitter_email TEXT,
    submitter_phone TEXT,
    submitter_relationship TEXT,
    action_type TEXT, -- 'claim_relationship', 'add_relative', 'update_photo'
    new_relative_name TEXT,
    new_relative_birth TEXT,
    new_relative_death TEXT,
    new_relative_type TEXT, -- 'father', 'mother', 'spouse', 'child'
    photo_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data for Grandpa
INSERT INTO public.family_tree_nodes (id, full_name, birth_year, death_year, gender) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Albert Jola Olusegun Koya John', '1948', '2026', 'male')
ON CONFLICT DO NOTHING;
