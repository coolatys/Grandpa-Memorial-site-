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
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4">Family Tree</h1>
          <p className="text-lg text-stone-600 max-w-2xl">
            Explore our roots and connections. Click on any family member to view details or add your own connection to the tree.
          </p>
        </div>

        <FamilyTreeClient />
      </div>
    </div>
  );
}
