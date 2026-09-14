// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminFamilyTreePage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'live'>('queue');

  // Queue State
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Live Tree State
  const [liveNodes, setLiveNodes] = useState<any[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'queue') fetchQueue();
    else fetchLiveNodes();
  }, [activeTab]);

  const fetchQueue = async () => {
    setLoadingQueue(true);
    const { data } = await supabase
      .from('family_tree_requests')
      .select('*, target_node:family_tree_nodes!target_node_id(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
    setLoadingQueue(false);
  };

  const fetchLiveNodes = async () => {
    setLoadingLive(true);
    // Fetch nodes + their edge counts (approx)
    const { data: nodes } = await supabase
      .from('family_tree_nodes')
      .select('*')
      .order('full_name');
    
    const { data: edges } = await supabase
      .from('family_tree_edges')
      .select('from_node_id, to_node_id');

    if (nodes) {
      const enhancedNodes = nodes.map(n => {
        const edgeCount = (edges || []).filter(e => e.from_node_id === n.id || e.to_node_id === n.id).length;
        return { ...n, edgeCount, isOrphaned: edgeCount === 0 };
      });
      setLiveNodes(enhancedNodes);
    }
    setLoadingLive(false);
  };

  const handleApprove = async (req: any) => {
    try {
      if (req.request_type === 'new_node') {
        const { node, edges } = req.proposed_data;
        node.status = 'approved';
        
        // 1. Insert Node
        const { data: insertedNode, error: nodeErr } = await supabase
          .from('family_tree_nodes')
          .insert([node])
          .select()
          .single();
        if (nodeErr) throw nodeErr;

        // 2. Insert Edges
        if (edges && edges.length > 0) {
          const edgesToInsert = edges.map((e: any) => ({
            from_node_id: insertedNode.id,
            to_node_id: e.target_node_id,
            relationship_type: e.relationship_type
          }));
          const { error: edgeErr } = await supabase.from('family_tree_edges').insert(edgesToInsert);
          if (edgeErr) throw edgeErr;
        }
      } else if (req.request_type === 'edit_node') {
        const { edit_target_id, changes } = req.proposed_data;
        const { error: updateErr } = await supabase
          .from('family_tree_nodes')
          .update(changes)
          .eq('id', edit_target_id);
        if (updateErr) throw updateErr;
      }

      // Mark request approved
      await supabase.from('family_tree_requests').update({ status: 'approved' }).eq('id', req.id);
      fetchQueue();
    } catch (err) {
      console.error(err);
      alert('Error approving request');
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      await supabase
        .from('family_tree_requests')
        .update({ status: 'rejected', rejection_reason: rejectReason })
        .eq('id', rejectingId);
      setRejectingId(null);
      setRejectReason('');
      fetchQueue();
    } catch (err) {
      console.error(err);
      alert('Error rejecting request');
    }
  };

  const handleLiveNodeDelete = async (nodeId: string) => {
    if (!confirm('Are you sure you want to delete this node? Connected edges will be orphaned but other nodes will NOT be deleted.')) return;
    try {
      // Because we used ON DELETE SET NULL on the edges, deleting the node just orphans the edges.
      // But actually, we want to physically delete the edges connected to this node to clean up.
      // Or we can just delete the node and let ON DELETE CASCADE or SET NULL do its job.
      // The prompt asks to "keep connected nodes intact, but remove/flag edges".
      
      // Delete edges connecting this node manually to be clean:
      await supabase.from('family_tree_edges').delete().or(`from_node_id.eq.${nodeId},to_node_id.eq.${nodeId}`);
      
      // Delete the node
      await supabase.from('family_tree_nodes').delete().eq('id', nodeId);
      fetchLiveNodes();
    } catch (err) {
      console.error(err);
      alert('Error deleting node');
    }
  };

  const handleLiveNodeEditSubmit = async (e: React.FormEvent, nodeId: string) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      full_name: formData.get('full_name'),
      birth_year: formData.get('birth_year'),
      death_year: formData.get('death_year'),
      is_deceased: formData.get('is_deceased') === 'true',
      bio: formData.get('bio'),
      contact_info: formData.get('contact_info')
    };

    try {
      await supabase.from('family_tree_nodes').update(updates).eq('id', nodeId);
      setEditingNodeId(null);
      fetchLiveNodes();
    } catch (err) {
      console.error(err);
      alert('Error updating node');
    }
  };

  const filteredLiveNodes = liveNodes.filter(n => n.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif text-primary mb-8">Family Tree Administration</h1>
      
      {/* TABS */}
      <div className="flex gap-4 border-b border-stone-200 mb-8">
        <button 
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'queue' ? 'border-b-2 border-primary text-primary' : 'text-stone-500 hover:text-stone-800'}`}
          onClick={() => setActiveTab('queue')}
        >
          Moderation Queue ({activeTab === 'queue' ? requests.length : '...'})
        </button>
        <button 
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'live' ? 'border-b-2 border-primary text-primary' : 'text-stone-500 hover:text-stone-800'}`}
          onClick={() => setActiveTab('live')}
        >
          Live Tree Management
        </button>
      </div>

      {/* QUEUE TAB */}
      {activeTab === 'queue' && (
        <div>
          {loadingQueue ? <p>Loading queue...</p> : requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
              <p className="text-stone-500 font-medium">No pending requests.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map(req => (
                <div key={req.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-start">
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs font-bold rounded-md mb-2 ${req.request_type === 'new_node' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {req.request_type === 'new_node' ? 'NEW RELATIVE' : 'SUGGESTED EDIT'}
                      </span>
                      <p className="text-sm text-stone-600">
                        Submitted by: <strong className="text-stone-900">{req.submitter_info?.name}</strong> 
                        {req.submitter_info?.relationship && ` (${req.submitter_info.relationship})`}
                      </p>
                      <p className="text-xs text-stone-500">{req.submitter_info?.email} | {req.submitter_info?.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-400">{new Date(req.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    {req.request_type === 'new_node' ? (
                      <div className="flex gap-6">
                        {req.proposed_data?.node?.photo_url && (
                          <div className="w-24 h-24 rounded-full border bg-stone-100 overflow-hidden flex-shrink-0">
                            <img src={req.proposed_data.node.photo_url} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div><span className="text-xs text-stone-400 block">Name</span><p className="font-medium">{req.proposed_data?.node?.full_name}</p></div>
                          <div><span className="text-xs text-stone-400 block">Status</span><p className="font-medium">{req.proposed_data?.node?.is_deceased ? 'Deceased' : 'Alive'}</p></div>
                          <div><span className="text-xs text-stone-400 block">Dates</span><p className="font-medium">{req.proposed_data?.node?.birth_year || '?'} - {req.proposed_data?.node?.is_deceased ? (req.proposed_data?.node?.death_year || '?') : 'Present'}</p></div>
                          {req.proposed_data?.edges?.map((e: any, i: number) => (
                            <div key={i} className="col-span-2">
                              <span className="text-xs text-stone-400 block">Connecting To</span>
                              <p className="font-medium text-primary">Adding as <strong className="uppercase">{e.relationship_type}</strong> to {req.target_node?.full_name}</p>
                            </div>
                          ))}
                          {req.proposed_data?.node?.bio && <div className="col-span-2"><span className="text-xs text-stone-400 block">Bio</span><p className="text-sm bg-stone-50 p-2 rounded">{req.proposed_data.node.bio}</p></div>}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4 text-sm font-medium">Target Node: <span className="text-primary">{req.target_node?.full_name}</span></p>
                        <table className="w-full text-sm border border-stone-200">
                          <thead className="bg-stone-50">
                            <tr><th className="p-2 border-b text-left">Field</th><th className="p-2 border-b text-left text-red-600">Current (Live)</th><th className="p-2 border-b text-left text-green-600">Proposed Change</th></tr>
                          </thead>
                          <tbody>
                            {Object.entries(req.proposed_data?.changes || {}).map(([key, val]) => (
                              <tr key={key} className="border-b">
                                <td className="p-2 font-medium bg-stone-50 w-1/4">{key}</td>
                                <td className="p-2 text-stone-500 w-1/3 line-through">{req.target_node?.[key]?.toString() || 'empty'}</td>
                                <td className="p-2 text-green-700 bg-green-50/50 w-1/3 font-medium">{val?.toString() || 'empty'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-end gap-3">
                    {rejectingId === req.id ? (
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Reason for rejection (optional)..." 
                          value={rejectReason} 
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="flex-1 px-3 py-1 border border-stone-300 rounded text-sm focus:outline-none"
                        />
                        <button onClick={handleReject} className="px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Confirm Reject</button>
                        <button onClick={() => setRejectingId(null)} className="px-4 py-1 text-stone-500 text-sm hover:bg-stone-200 rounded">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setRejectingId(req.id)} className="px-4 py-2 border border-stone-300 text-stone-600 rounded-md text-sm hover:bg-stone-100 transition">Reject</button>
                        <button onClick={() => handleApprove(req)} className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-stone-800 transition">Approve & Publish</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LIVE TREE TAB */}
      {activeTab === 'live' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
            <h2 className="font-serif text-lg text-primary">Active Nodes</h2>
            <input 
              type="text" 
              placeholder="Search nodes..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="px-3 py-1 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-primary w-64 text-sm"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-left text-stone-500 font-medium">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Edges</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loadingLive ? (
                  <tr><td colSpan={5} className="p-6 text-center text-stone-500">Loading live nodes...</td></tr>
                ) : filteredLiveNodes.map(node => (
                  <tr key={node.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden flex-shrink-0">
                          {node.photo_url && <img src={node.photo_url} className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-stone-800">{node.full_name}</span>
                        {node.isOrphaned && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded uppercase font-bold">Orphaned</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      {node.is_deceased ? <span className="text-stone-500">Deceased</span> : <span className="text-green-600 font-medium">Alive</span>}
                    </td>
                    <td className="p-3 text-stone-500">
                      {node.birth_year || '?'} - {node.is_deceased ? (node.death_year || '?') : 'Present'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-md text-xs">{node.edgeCount} connections</span>
                    </td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      <button onClick={() => setEditingNodeId(node.id)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition">Direct Edit</button>
                      <button onClick={() => handleLiveNodeDelete(node.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inline Edit Modal */}
          {editingNodeId && (
            <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                <h3 className="font-serif text-xl mb-4 text-primary">Direct Edit Node</h3>
                <form onSubmit={(e) => handleLiveNodeEditSubmit(e, editingNodeId)} className="space-y-4">
                  {(() => {
                    const node = liveNodes.find(n => n.id === editingNodeId);
                    return (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-stone-500 mb-1">Full Name</label>
                          <input name="full_name" defaultValue={node?.full_name} className="w-full px-3 py-2 border rounded" required />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-stone-500 mb-1">Birth Year</label>
                            <input name="birth_year" defaultValue={node?.birth_year || ''} className="w-full px-3 py-2 border rounded" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-stone-500 mb-1">Death Year</label>
                            <input name="death_year" defaultValue={node?.death_year || ''} className="w-full px-3 py-2 border rounded" />
                          </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-stone-500 mb-1">Status</label>
                           <select name="is_deceased" defaultValue={node?.is_deceased ? 'true' : 'false'} className="w-full px-3 py-2 border rounded">
                             <option value="true">Deceased</option>
                             <option value="false">Alive</option>
                           </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-500 mb-1">Bio</label>
                          <textarea name="bio" defaultValue={node?.bio || ''} className="w-full px-3 py-2 border rounded" rows={3}></textarea>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                          <button type="button" onClick={() => setEditingNodeId(null)} className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-stone-800">Save Direct Edit</button>
                        </div>
                      </>
                    );
                  })()}
                </form>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
