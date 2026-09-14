-- family_tree_v2.sql

-- Drop old tables if they exist
DROP TABLE IF EXISTS public.family_tree_submissions CASCADE;
DROP TABLE IF EXISTS public.family_tree_edges CASCADE;
DROP TABLE IF EXISTS public.family_tree_requests CASCADE;
DROP TABLE IF EXISTS public.family_tree_nodes CASCADE;

-- 1. Nodes Table
CREATE TABLE public.family_tree_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    birth_year TEXT,
    death_year TEXT,
    is_deceased BOOLEAN DEFAULT true,
    photo_url TEXT,
    bio TEXT,
    contact_info TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Edges Table (Graph Relationships)
CREATE TABLE public.family_tree_edges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_node_id UUID REFERENCES public.family_tree_nodes(id) ON DELETE SET NULL,
    to_node_id UUID REFERENCES public.family_tree_nodes(id) ON DELETE SET NULL,
    relationship_type TEXT NOT NULL, -- parent, child, spouse, sibling, cousin, in-law, godparent, other
    relationship_desc TEXT, -- for custom free-text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Requests Table (Moderation Queue)
CREATE TABLE public.family_tree_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_type TEXT NOT NULL, -- new_node, edit_node
    target_node_id UUID REFERENCES public.family_tree_nodes(id) ON DELETE CASCADE, -- nullable if new_node has no target yet, but usually connects to something
    submitter_info JSONB, -- { name, email, phone, relationship_to_target }
    proposed_data JSONB, -- { new node fields } OR { diff fields for edit }
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.family_tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_tree_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_tree_requests ENABLE ROW LEVEL SECURITY;

-- Public can read approved nodes
CREATE POLICY "Public can read approved nodes" ON public.family_tree_nodes
    FOR SELECT USING (status = 'approved');

-- Public can read all edges (for the approved nodes)
CREATE POLICY "Public can read edges" ON public.family_tree_edges
    FOR SELECT USING (true);

-- Public can insert requests
CREATE POLICY "Public can insert requests" ON public.family_tree_requests
    FOR INSERT WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "Admins can manage nodes" ON public.family_tree_nodes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage edges" ON public.family_tree_edges
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage requests" ON public.family_tree_requests
    FOR ALL USING (auth.role() = 'authenticated');
