-- Add deceased status flag to nodes and submissions
ALTER TABLE public.family_tree_nodes 
ADD COLUMN IF NOT EXISTS is_deceased BOOLEAN DEFAULT true;

ALTER TABLE public.family_tree_submissions 
ADD COLUMN IF NOT EXISTS new_relative_is_deceased BOOLEAN DEFAULT true;
