import { supabase } from '@/lib/supabase';
import FamilyTreeClient from './FamilyTreeClient';

export const revalidate = 10;

export default async function FamilyTreePage() {
  const { data: members } = await supabase
    .from('family_members')
    .select('*')
    .eq('status', 'approved');

  // Fallback data if none exists
  const displayMembers = members && members.length > 0 ? members : [
    { id: '1', full_name: 'Grandpa', relationship_to_grandpa: 'Self', parent_id: null, spouse_id: null },
    { id: '2', full_name: 'Grandma', relationship_to_grandpa: 'Spouse', parent_id: null, spouse_id: '1' },
    { id: '3', full_name: 'Son', relationship_to_grandpa: 'Child', parent_id: '1', spouse_id: null },
  ];

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 text-primary">Family Tree</h1>
        <p className="text-stone-600 max-w-2xl mx-auto text-lg">
          Explore our family roots and add yourself to the tree.
        </p>
      </div>

      <FamilyTreeClient members={displayMembers as any[]} />
    </div>
  );
}
