'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminFamilyTree() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [subRes, nodeRes] = await Promise.all([
      supabase.from('family_tree_submissions').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('family_tree_nodes').select('id, full_name')
    ]);
    
    if (subRes.data) setSubmissions(subRes.data);
    if (nodeRes.data) setNodes(nodeRes.data);
  };

  const getNodeName = (id: string) => {
    return nodes.find(n => n.id === id)?.full_name || 'Unknown Node';
  };

  const handleApprove = async (sub: any) => {
    try {
      if (sub.action_type === 'add_relative') {
        // Insert new node into tree
        let parent_id = null;
        let spouse_id = null;
        
        if (sub.new_relative_type === 'child') {
          parent_id = sub.target_node_id;
        } else if (sub.new_relative_type === 'spouse') {
          spouse_id = sub.target_node_id;
        }
        
        // @ts-ignore
        const { data: newNode, error: insertError } = await supabase.from('family_tree_nodes').insert({
          full_name: sub.new_relative_name,
          birth_year: sub.new_relative_birth,
          death_year: sub.new_relative_death,
          photo_url: sub.photo_url,
          parent_id,
          spouse_id
        }).select().single();

        if (insertError) throw insertError;

        // If father/mother, we actually need to update the target node to point to this new parent
        if (sub.new_relative_type === 'father' || sub.new_relative_type === 'mother') {
          // @ts-ignore
          await supabase.from('family_tree_nodes').update({ parent_id: newNode.id }).eq('id', sub.target_node_id);
        }
      } else if (sub.action_type === 'claim_relationship') {
        // If they provided a photo for an existing node, update the node's photo
        if (sub.photo_url) {
          // @ts-ignore
          await supabase.from('family_tree_nodes').update({ photo_url: sub.photo_url }).eq('id', sub.target_node_id);
        }
      }

      // Mark as approved
      // @ts-ignore
      await supabase.from('family_tree_submissions').update({ status: 'approved' }).eq('id', sub.id);
      setSubmissions(submissions.filter(s => s.id !== sub.id));
      alert('Approved and merged into live tree.');
    } catch (err) {
      console.error(err);
      alert('Failed to approve submission.');
    }
  };

  const handleReject = async (id: string) => {
    // @ts-ignore
    await supabase.from('family_tree_submissions').update({ status: 'rejected' }).eq('id', id);
    setSubmissions(submissions.filter(s => s.id !== id));
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-stone-800 mb-6">Family Tree Submissions</h1>
      
      {submissions.length === 0 ? (
        <p className="text-stone-500">No pending submissions.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${sub.action_type === 'add_relative' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {sub.action_type === 'add_relative' ? 'Add Relative' : 'Claim Relationship'}
                    </span>
                    <span className="text-sm text-stone-500">{new Date(sub.created_at).toLocaleString()}</span>
                  </div>

                  {sub.action_type === 'add_relative' ? (
                    <div>
                      <p className="font-medium text-lg">Wants to add a <span className="font-bold underline">{sub.new_relative_type}</span> for {getNodeName(sub.target_node_id)}</p>
                      <div className="mt-3 bg-stone-50 p-4 rounded border border-stone-200">
                        <p><strong>Name:</strong> {sub.new_relative_name}</p>
                        <p><strong>Years:</strong> {sub.new_relative_birth || '?'} - {sub.new_relative_death || '?'}</p>
                        {sub.photo_url && <a href={sub.photo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-2 inline-block">View Submitted Photo &rarr;</a>}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-lg">Claims to be <span className="font-bold underline">{sub.submitter_relationship}</span> of {getNodeName(sub.target_node_id)}</p>
                      {sub.photo_url && (
                        <div className="mt-3 bg-stone-50 p-4 rounded border border-stone-200">
                          <p className="text-sm font-medium mb-2">Submitted Photo Update for {getNodeName(sub.target_node_id)}:</p>
                          <img src={sub.photo_url} alt="Submitted" className="w-24 h-24 object-cover rounded shadow" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm text-stone-600 bg-stone-50 px-3 py-2 rounded">
                    <strong>Submitter:</strong> {sub.submitter_name} <br/>
                    {sub.submitter_email && <><a href={`mailto:${sub.submitter_email}`} className="text-primary">{sub.submitter_email}</a><br/></>}
                    {sub.submitter_phone && <span>{sub.submitter_phone}</span>}
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col gap-3 min-w-[120px]">
                  <button onClick={() => handleApprove(sub)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-medium text-sm text-center">Approve</button>
                  <button onClick={() => handleReject(sub.id)} className="flex-1 bg-stone-200 text-stone-700 px-4 py-2 rounded-md hover:bg-stone-300 transition font-medium text-sm text-center">Reject</button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
