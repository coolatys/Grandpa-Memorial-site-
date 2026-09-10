// @ts-nocheck
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';

// dynamically import react-d3-tree to prevent SSR issues
const Tree = dynamic(() => import('react-d3-tree'), { ssr: false });

type Person = {
  id: string;
  full_name: string;
  birth_year: string | null;
  death_year: string | null;
  photo_url: string | null;
  parent_id: string | null;
  spouse_id: string | null;
  gender: string | null;
};

type TreeNode = {
  name: string;
  attributes: {
    primary?: Person | any;
    spouse?: Person | any;
    isPlaceholderCouple?: boolean;
    childIdForPlaceholder?: string;
    isSuperRoot?: boolean;
    expanded?: boolean;
  } | Record<string, any>;
  children: TreeNode[];
};

export default function FamilyTreeClient() {
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add_relative' | 'claim_relationship'>('claim_relationship');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPlaceholderType, setSelectedPlaceholderType] = useState<string | null>(null); // 'Father', 'Mother', 'Spouse', 'Child'
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Tree View State
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [translate, setTranslate] = useState({ x: 0, y: 150 });
  const [treeContainer, setTreeContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchMembers();
    
    // Set initial translation based on screen size
    if (typeof window !== 'undefined') {
      setTranslate({ x: window.innerWidth / 2, y: 150 });
    }
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_tree_nodes')
        .select('*');
      if (!error && data) {
        setMembers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const treeData = useMemo(() => {
    if (!members.length) {
      // Visible empty state
      return {
        name: 'EmptyTree',
        attributes: { 
          primary: { id: 'empty', full_name: 'Start the Family Tree', birth_year: null, death_year: null, photo_url: null, parent_id: null, spouse_id: null, gender: null },
          isEmptyState: true
        },
        children: []
      };
    }

    // Basic hierarchy building (for demonstration)
    // 1. Group couples
    const processedIds = new Set<string>();
    const couples: { primary: Person; spouse?: Person; children: Person[] }[] = [];
    
    // Helper to find descendants
    const getChildren = (parentId: string) => members.filter(m => m.parent_id === parentId);

    // Find root nodes (no parent in the DB)
    const roots = members.filter(m => !m.parent_id && !processedIds.has(m.id));

    // A recursive function to build the tree node
    const buildNode = (person: Person): TreeNode => {
      processedIds.add(person.id);
      let spouse: Person | undefined = undefined;
      
      if (person.spouse_id) {
        spouse = members.find(m => m.id === person.spouse_id);
        if (spouse) processedIds.add(spouse.id);
      } else {
        // Also check if anyone claims this person as a spouse
        const reverseSpouse = members.find(m => m.spouse_id === person.id);
        if (reverseSpouse) {
          spouse = reverseSpouse;
          processedIds.add(spouse.id);
        }
      }

      const children = getChildren(person.id);
      if (spouse) {
        const spouseChildren = getChildren(spouse.id);
        for (const sc of spouseChildren) {
          if (!children.find(c => c.id === sc.id)) children.push(sc);
        }
      }

      return {
        name: person.id,
        attributes: {
          primary: person,
          spouse: spouse,
        },
        children: children.map(c => buildNode(c))
      };
    };

    const rootNodes = roots.map(r => buildNode(r));

    // Wrap in a super root so multiple separate families can render
    return {
      name: 'SuperRoot',
      attributes: { isSuperRoot: true },
      children: rootNodes.map(rn => ({
        name: 'Placeholder_' + rn.name,
        attributes: { isPlaceholderCouple: true, childIdForPlaceholder: rn.attributes.primary?.id },
        children: [rn]
      }))
    };
  }, [members]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      target_node_id: targetNodeId,
      submitter_name: formData.get('submitter_name') as string,
      submitter_email: formData.get('submitter_email') as string,
      submitter_phone: formData.get('submitter_phone') as string,
      submitter_relationship: formData.get('submitter_relationship') as string,
      action_type: modalMode,
      new_relative_name: formData.get('new_relative_name') as string || null,
      new_relative_birth: formData.get('new_relative_birth') as string || null,
      new_relative_death: formData.get('new_relative_death') as string || null,
      new_relative_type: selectedPlaceholderType,
      photo_url: formData.get('photo_url') as string || null,
      status: 'pending' as const,
    };

    // @ts-ignore
    const { error } = await supabase.from('family_tree_submissions').insert(data);

    setIsSubmitting(false);
    if (!error) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 3000);
    } else {
      alert('Failed to submit. Please try again.');
    }
  };

  const handleNodeClick = (nodeDatum: any, e: any) => {
    // If it's the super root, do nothing
    if (nodeDatum.attributes?.isSuperRoot) return;

    // Check if clicked on add mother/father
    const targetEl = e.target as SVGElement;
    const action = targetEl.getAttribute('data-action');
    
    if (nodeDatum.attributes?.isPlaceholderCouple) {
      if (action === 'add-father' || action === 'add-mother') {
        setModalMode('add_relative');
        setTargetNodeId(nodeDatum.attributes.childIdForPlaceholder || null);
        setSelectedPlaceholderType(action === 'add-father' ? 'father' : 'mother');
        setSelectedPerson(null);
        setShowModal(true);
      }
      return;
    }

    if (action === 'click-primary' && nodeDatum.attributes?.primary) {
      setModalMode('claim_relationship');
      setTargetNodeId(nodeDatum.attributes.primary.id);
      setSelectedPerson(nodeDatum.attributes.primary);
      setShowModal(true);
    } else if (action === 'click-spouse' && nodeDatum.attributes?.spouse) {
      setModalMode('claim_relationship');
      setTargetNodeId(nodeDatum.attributes.spouse.id);
      setSelectedPerson(nodeDatum.attributes.spouse);
      setShowModal(true);
    }
  };

  // Custom rendering for the nodes
  const renderCustomNodeElement = useCallback(({ nodeDatum, toggleNode }: any) => {
    if (nodeDatum.attributes?.isSuperRoot) {
      return <g></g>; // Invisible
    }

    if (nodeDatum.attributes?.isEmptyState) {
      return (
        <g className="cursor-pointer" transform="translate(-60, -80)" onClick={(e) => handleNodeClick(nodeDatum, {target: {getAttribute: () => 'click-primary'}})}>
          <rect width="120" height="160" fill="#f8fafc" rx="12" stroke="#2F4538" strokeWidth="2" strokeDasharray="6,6" data-action="click-primary" />
          <circle cx="60" cy="50" r="24" fill="#e2e8f0" data-action="click-primary" />
          <path d="M60 40v20M50 50h20" stroke="#64748b" strokeWidth="2" strokeLinecap="round" data-action="click-primary" />
          <text x="60" y="100" textAnchor="middle" fill="#475569" className="text-sm font-bold font-sans" data-action="click-primary">Start Tree</text>
        </g>
      );
    }

    if (nodeDatum.attributes?.isPlaceholderCouple) {
      // Render Dashed "Add Father" and "Add Mother"
      return (
        <g>
          {/* Add Father */}
          <g className="cursor-pointer" transform="translate(-140, -80)" onClick={(e) => handleNodeClick(nodeDatum, {target: {getAttribute: () => 'add-father'}})}>
            <rect width="120" height="160" fill="#f8fafc" rx="12" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,6" data-action="add-father" />
            <circle cx="60" cy="50" r="24" fill="#e2e8f0" data-action="add-father" />
            <path d="M60 40v20M50 50h20" stroke="#64748b" strokeWidth="2" strokeLinecap="round" data-action="add-father" />
            <text x="60" y="100" textAnchor="middle" fill="#475569" className="text-sm font-medium font-sans" data-action="add-father">Add Father</text>
          </g>

          {/* Connection line between them */}
          <line x1="-20" y1="0" x2="20" y2="0" stroke="#cbd5e1" strokeWidth="2" />

          {/* Add Mother */}
          <g className="cursor-pointer" transform="translate(20, -80)" onClick={(e) => handleNodeClick(nodeDatum, {target: {getAttribute: () => 'add-mother'}})}>
            <rect width="120" height="160" fill="#f8fafc" rx="12" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,6" data-action="add-mother" />
            <circle cx="60" cy="50" r="24" fill="#e2e8f0" data-action="add-mother" />
            <path d="M60 40v20M50 50h20" stroke="#64748b" strokeWidth="2" strokeLinecap="round" data-action="add-mother" />
            <text x="60" y="100" textAnchor="middle" fill="#475569" className="text-sm font-medium font-sans" data-action="add-mother">Add Mother</text>
          </g>
        </g>
      );
    }

    const { primary, spouse } = nodeDatum.attributes;
    const defaultAvatar = "https://images.unsplash.com/photo-1544502062-f82887f03d1c?q=80&w=200&auto=format&fit=crop";

    // Split names to make surname bold
    const formatName = (fullName: string) => {
      const parts = fullName.split(' ');
      const last = parts.pop();
      const first = parts.join(' ');
      return { first, last };
    };

    const hasSpouse = !!spouse;
    const primaryOffset = hasSpouse ? -140 : -60;
    const spouseOffset = 20;

    return (
      <g>
        {/* Primary Person */}
        <g className="cursor-pointer transition-transform hover:scale-105" transform={`translate(${primaryOffset}, -80)`} onClick={(e) => handleNodeClick(nodeDatum, {target: {getAttribute: () => 'click-primary'}})}>
          <rect width="120" height="160" fill="#ffffff" rx="12" stroke="#2F4538" strokeWidth="1" className="shadow-lg" data-action="click-primary" />
          
          <clipPath id={`clip-${primary.id}`}>
            <circle cx="60" cy="50" r="32" />
          </clipPath>
          <circle cx="60" cy="50" r="34" fill="#f5f5f4" stroke="#2F4538" strokeWidth="2" data-action="click-primary" />
          <image 
            href={primary.photo_url || defaultAvatar}
            x="20" y="10" 
            height="80" width="80" 
            clipPath={`url(#clip-${primary.id})`} 
            preserveAspectRatio="xMidYMid slice"
            data-action="click-primary"
          />

          <text x="60" y="110" textAnchor="middle" fill="#1c1917" className="text-sm font-sans" data-action="click-primary">
            {formatName(primary.full_name).first}
          </text>
          <text x="60" y="125" textAnchor="middle" fill="#1c1917" className="text-sm font-bold font-sans" data-action="click-primary">
            {formatName(primary.full_name).last}
          </text>
          <text x="60" y="145" textAnchor="middle" fill="#78716c" className="text-xs font-sans" data-action="click-primary">
            {primary.birth_year || '?'}{' - '}{primary.death_year || '?'}
          </text>
        </g>

        {/* Spouse Connector & Spouse Card */}
        {hasSpouse && (
          <g>
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#94a3b8" strokeWidth="2" />
            
            <g className="cursor-pointer transition-transform hover:scale-105" transform={`translate(${spouseOffset}, -80)`} onClick={(e) => handleNodeClick(nodeDatum, {target: {getAttribute: () => 'click-spouse'}})}>
              <rect width="120" height="160" fill="#ffffff" rx="12" stroke="#C39958" strokeWidth="1" className="shadow-lg" data-action="click-spouse" />
              
              <clipPath id={`clip-${spouse.id}`}>
                <circle cx="60" cy="50" r="32" />
              </clipPath>
              <circle cx="60" cy="50" r="34" fill="#f5f5f4" stroke="#C39958" strokeWidth="2" data-action="click-spouse" />
              <image 
                href={spouse.photo_url || defaultAvatar}
                x="20" y="10" 
                height="80" width="80" 
                clipPath={`url(#clip-${spouse.id})`} 
                preserveAspectRatio="xMidYMid slice"
                data-action="click-spouse"
              />

              <text x="60" y="110" textAnchor="middle" fill="#1c1917" className="text-sm font-sans" data-action="click-spouse">
                {formatName(spouse.full_name).first}
              </text>
              <text x="60" y="125" textAnchor="middle" fill="#1c1917" className="text-sm font-bold font-sans" data-action="click-spouse">
                {formatName(spouse.full_name).last}
              </text>
              <text x="60" y="145" textAnchor="middle" fill="#78716c" className="text-xs font-sans" data-action="click-spouse">
                {spouse.birth_year || '?'}{' - '}{spouse.death_year || '?'}
              </text>
            </g>
          </g>
        )}

        {/* Expand/Collapse chevron if node has children */}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <g onClick={toggleNode} className="cursor-pointer" transform="translate(0, 95)">
            <circle cx="0" cy="0" r="12" fill="#EAE6DF" stroke="#2F4538" strokeWidth="1" />
            <path d={nodeDatum.__expanded ? "M-4 2l4-4 4 4" : "M-4 -2l4 4 4-4"} stroke="#2F4538" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>
    );
  }, []);

  if (loading) return <div className="text-center py-24 text-stone-500">Loading Family Tree...</div>;

  return (
    <div className="space-y-4">
      {/* Tree Visualization */}
      <div 
        className="w-full bg-[#f8faf9] rounded-xl shadow-inner border border-stone-200 overflow-hidden relative group flex flex-col"
        ref={setTreeContainer}
      >
        {/* Controls Bar */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))} className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-md text-stone-700 hover:bg-stone-50 font-bold text-xl active:bg-stone-100" aria-label="Zoom In">+</button>
          <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.2))} className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-md text-stone-700 hover:bg-stone-50 font-bold text-xl active:bg-stone-100" aria-label="Zoom Out">-</button>
          <button onClick={() => { setZoomLevel(0.8); if(treeContainer) setTranslate({x: treeContainer.clientWidth / 2, y: 150}); }} className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-md text-stone-700 hover:bg-stone-50 text-xs font-medium active:bg-stone-100">Reset</button>
        </div>

        {/* CSS to hide the root node links to its children (the super root is invisible, we don't want lines drawn to the first generation placeholders) */}
        <style dangerouslySetInnerHTML={{__html: `
          .rd3t-link { stroke: #cbd5e1; stroke-width: 2px; }
          .rd3t-g:first-child > path.rd3t-link { display: none; }
        `}} />

        <div className="w-full h-[75vh] md:h-[800px] cursor-grab active:cursor-grabbing touch-none">
          <Tree
            data={treeData as any}
            orientation="vertical"
            pathFunc="step"
            zoom={zoomLevel}
            translate={translate}
            nodeSize={{ x: 300, y: 250 }}
            enableLegacyTransitions={true}
            transitionDuration={400}
            renderCustomNodeElement={renderCustomNodeElement}
          />
        </div>
      </div>

      {/* Modal / Side Panel */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm md:justify-end md:p-0">
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-white w-full max-w-md h-full max-h-[90vh] md:max-h-screen md:h-screen shadow-2xl overflow-y-auto flex flex-col rounded-xl md:rounded-none"
            >
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50 sticky top-0 z-10">
                <h3 className="text-xl font-serif text-primary">
                  {modalMode === 'add_relative' ? 'Add a Family Member' : 'Claim Relationship'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-stone-400 hover:text-stone-600 p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {modalMode === 'claim_relationship' && selectedPerson && (
                  <div className="flex items-center gap-4 mb-8 bg-stone-50 p-4 rounded-lg border border-stone-100">
                    <img src={selectedPerson.photo_url || "https://images.unsplash.com/photo-1544502062-f82887f03d1c?q=80&w=200"} className="w-16 h-16 rounded-full object-cover border border-stone-200" />
                    <div>
                      <p className="font-bold text-stone-800">{selectedPerson.full_name}</p>
                      <p className="text-sm text-stone-500">{selectedPerson.birth_year || '?'} - {selectedPerson.death_year || '?'}</p>
                    </div>
                  </div>
                )}

                {modalMode === 'add_relative' && (
                  <div className="mb-6 bg-primary/10 text-primary p-4 rounded-lg border border-primary/20 text-sm">
                    Adding a <strong>{selectedPlaceholderType}</strong> to the family tree.
                  </div>
                )}

                {success ? (
                  <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center">
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
                    <p className="font-medium text-lg mb-2">Submitted Successfully</p>
                    <p className="text-sm">Your submission is pending review by the family administrators. Thank you!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Add Relative Fields */}
                    {modalMode === 'add_relative' && (
                      <div className="space-y-4 pb-4 border-b border-stone-100">
                        <h4 className="font-medium text-stone-800">New Relative Details</h4>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Full Name *</label>
                          <input required name="new_relative_name" type="text" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Birth Year</label>
                            <input name="new_relative_birth" type="text" placeholder="YYYY" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Death Year</label>
                            <input name="new_relative_death" type="text" placeholder="YYYY" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Common Fields */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-stone-800">Your Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          {modalMode === 'claim_relationship' ? `How are you related to ${selectedPerson?.full_name}? *` : 'How are you related to the person you are adding? *'}
                        </label>
                        <select required name="submitter_relationship" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white">
                          <option value="">Select relationship...</option>
                          <option value="Child">Child</option>
                          <option value="Grandchild">Grandchild</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Niece/Nephew">Niece/Nephew</option>
                          <option value="Cousin">Cousin</option>
                          <option value="In-law">In-law</option>
                          <option value="Other">Other / Parent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Your Full Name *</label>
                        <input required name="submitter_name" type="text" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Email Address (Optional)</label>
                        <input name="submitter_email" type="email" placeholder="For contact list updates" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number (Optional)</label>
                        <input name="submitter_phone" type="tel" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Attach a Photo URL (Optional)</label>
                        <input name="photo_url" type="url" placeholder="https://..." className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        <p className="text-xs text-stone-500 mt-1">Provide an image link to attach to this person's record.</p>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50 font-medium mt-6"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit to Moderation Queue'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
