-- Enable RLS on both tables (in case it's not already)
ALTER TABLE public.family_tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_tree_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies just in case to avoid conflicts
DROP POLICY IF EXISTS "Allow public read on family_tree_nodes" ON public.family_tree_nodes;
DROP POLICY IF EXISTS "Allow public insert on family_tree_nodes" ON public.family_tree_nodes;
DROP POLICY IF EXISTS "Allow public update on family_tree_nodes" ON public.family_tree_nodes;
DROP POLICY IF EXISTS "Allow public read on submissions" ON public.family_tree_submissions;
DROP POLICY IF EXISTS "Allow public insert on submissions" ON public.family_tree_submissions;
DROP POLICY IF EXISTS "Allow public update on submissions" ON public.family_tree_submissions;

-- Create fully permissive policies for the anon key since the app doesn't use authenticated admin users yet
CREATE POLICY "Allow public read on family_tree_nodes" ON public.family_tree_nodes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on family_tree_nodes" ON public.family_tree_nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on family_tree_nodes" ON public.family_tree_nodes FOR UPDATE USING (true);

CREATE POLICY "Allow public read on submissions" ON public.family_tree_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on submissions" ON public.family_tree_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on submissions" ON public.family_tree_submissions FOR UPDATE USING (true);

-- Re-run the seed data just to be absolutely sure Grandpa is in there
INSERT INTO public.family_tree_nodes (id, full_name, birth_year, death_year, gender) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Albert Jola Olusegun Koya John', '1948', '2026', 'male')
ON CONFLICT DO NOTHING;
