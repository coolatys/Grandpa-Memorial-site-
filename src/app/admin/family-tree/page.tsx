'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminFamilyTree() {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('family_members')
      .select('*')
      .eq('status', 'pending')
      .then(({ data }) => {
        if (data) setMembers(data);
      });
  }, []);

  const handleUpdate = async (id: string, status: 'approved' | 'rejected') => {
    // @ts-ignore
    await supabase.from('family_members').update({ status }).eq('id', id);
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-stone-800 mb-6">Moderate Family Tree</h1>
      
      {members.length === 0 ? (
        <p className="text-stone-500">No pending submissions.</p>
      ) : (
        <div className="space-y-4">
          {members.map(member => (
            <div key={member.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-100 flex justify-between items-center">
              <div>
                <div className="font-medium">{member.full_name}</div>
                <div className="text-stone-600 text-sm mt-1">Relationship: {member.relationship_to_grandpa}</div>
                <div className="text-stone-500 text-xs mt-1">Email: {member.submitted_by_email}</div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleUpdate(member.id, 'approved')} className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200">Approve</button>
                <button onClick={() => handleUpdate(member.id, 'rejected')} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
