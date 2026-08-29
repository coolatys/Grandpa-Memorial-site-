'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

// react-d3-tree needs to be dynamically imported with ssr: false because it relies on window
const Tree = dynamic(() => import('react-d3-tree'), { ssr: false });

type FamilyMember = {
  id: string;
  full_name: string;
  relationship_to_grandpa: string;
  parent_id: string | null;
  spouse_id: string | null;
};

// Simple recursive function to build tree data
const buildTreeData = (members: FamilyMember[], rootId: string | null = null): any => {
  // If no rootId is provided, find the person with no parent (usually Grandpa)
  let rootNode = members.find(m => m.id === rootId);
  if (!rootNode) {
    rootNode = members.find(m => m.parent_id === null && m.spouse_id === null) || members[0];
  }

  if (!rootNode) return { name: 'Root not found' };

  const children = members.filter(m => m.parent_id === rootNode.id);
  const spouse = members.find(m => m.spouse_id === rootNode.id);

  return {
    name: rootNode.full_name,
    attributes: {
      relationship: rootNode.relationship_to_grandpa,
      ...(spouse && { spouse: spouse.full_name }),
    },
    children: children.map(child => buildTreeData(members, child.id)),
  };
};

export default function FamilyTreeClient({ members }: { members: FamilyMember[] }) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const treeData = useMemo(() => buildTreeData(members), [members]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      full_name: formData.get('full_name') as string,
      relationship_to_grandpa: formData.get('relationship') as string,
      parent_id: formData.get('parent_id') as string || null,
      submitted_by_email: formData.get('email') as string,
      status: 'pending' as const,
    };

    // @ts-ignore
    const { error } = await supabase.from('family_members').insert(data);

    setIsSubmitting(false);
    if (!error) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setShowForm(false), 3000);
    } else {
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Close Form' : 'Add Relative'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 max-w-2xl mx-auto">
          <h3 className="text-xl font-serif text-primary mb-4">Add a Family Member</h3>
          
          {success && (
            <div className="bg-green-50 text-green-800 p-4 rounded mb-4 text-sm">
              Thank you! Your submission is pending approval.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Full Name *</label>
              <input required name="full_name" type="text" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:ring-1 focus:ring-primary bg-stone-50" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Relationship to Grandpa *</label>
              <input required name="relationship" type="text" placeholder="e.g. Grandson" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:ring-1 focus:ring-primary bg-stone-50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Parent in Tree (Optional)</label>
              <select name="parent_id" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:ring-1 focus:ring-primary bg-stone-50">
                <option value="">None (or Grandpa)</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Your Email (for follow-up) *</label>
              <input required name="email" type="email" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:ring-1 focus:ring-primary bg-stone-50" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit to Tree'}
            </button>
          </form>
        </div>
      )}

      {/* Tree Visualization */}
      <div className="w-full h-[600px] bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden relative">
        <Tree
          data={treeData}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 400, y: 100 }}
          nodeSize={{ x: 200, y: 100 }}
          renderCustomNodeElement={(rd3tProps) => {
            const { nodeDatum, toggleNode } = rd3tProps;
            return (
              <g>
                <rect width="160" height="60" x="-80" y="-30" fill="#EAE6DF" rx="8" stroke="#2F4538" strokeWidth="2" onClick={toggleNode} />
                <text fill="#1c1917" strokeWidth="0" x="0" y="-5" textAnchor="middle" className="text-sm font-medium font-sans">
                  {nodeDatum.name}
                </text>
                {nodeDatum.attributes?.relationship && (
                  <text fill="#57534e" strokeWidth="0" x="0" y="15" textAnchor="middle" className="text-xs font-sans">
                    {nodeDatum.attributes.relationship}
                  </text>
                )}
              </g>
            );
          }}
        />
      </div>
    </div>
  );
}
