// @ts-nocheck
'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  is_deceased: boolean;
  photo_url: string | null;
  bio: string | null;
  contact_info: string | null;
  gender: string | null; // Keep for silhouette rendering fallback
};

type Edge = {
  id: string;
  from_node_id: string;
  to_node_id: string;
  relationship_type: string;
  relationship_desc: string | null;
};

type TreeNode = {
  name: string;
  attributes: {
    primary?: Person | any;
    spouse?: Person | any;
    isSuperRoot?: boolean;
    isEmptyState?: boolean;
    expanded?: boolean;
    otherEdges?: Edge[];
  } | Record<string, any>;
  children: TreeNode[];
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); 
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function FamilyTreeClient() {
  const [members, setMembers] = useState<Person[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [requestType, setRequestType] = useState<'new_node' | 'edit_node'>('new_node');
  
  // Connection type for new_node relative to target
  const [connectionType, setConnectionType] = useState<string>('child'); 
  const [customConnection, setCustomConnection] = useState('');

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDeceasedForm, setIsDeceasedForm] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tree View State
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [translate, setTranslate] = useState({ x: 0, y: 150 });

  useEffect(() => {
    fetchTreeData();
    if (typeof window !== 'undefined') {
      setTranslate({ x: window.innerWidth / 2, y: 150 });
    }
  }, []);

  const fetchTreeData = async () => {
    try {
      const [nodesRes, edgesRes] = await Promise.all([
        supabase.from('family_tree_nodes').select('*').eq('status', 'approved'),
        supabase.from('family_tree_edges').select('*')
      ]);
      
      if (!nodesRes.error && nodesRes.data) setMembers(nodesRes.data);
      if (!edgesRes.error && edgesRes.data) setEdges(edgesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const treeData = useMemo(() => {
    if (!members.length) {
      return {
        name: 'EmptyTree',
        attributes: { 
          primary: { id: 'empty', full_name: 'Start the Family Tree', birth_year: null, death_year: null, photo_url: null },
          isEmptyState: true
        },
        children: []
      };
    }

    const processedIds = new Set<string>();
    
    // Helpers to find relationships
    const getChildrenEdges = (parentId: string) => edges.filter(e => e.relationship_type === 'parent_child' && e.from_node_id === parentId);
    const getParentEdges = (childId: string) => edges.filter(e => e.relationship_type === 'parent_child' && e.to_node_id === childId);
    
    // Identify roots (nodes that are not children of anyone)
    const rootNodes = members.filter(m => getParentEdges(m.id).length === 0);
    // If no roots (circular dependency or empty), just pick the first person as root
    const startingNodes = rootNodes.length > 0 ? rootNodes : [members[0]];

    const buildNode = (person: Person): TreeNode => {
      processedIds.add(person.id);
      
      // Find spouse
      const spouseEdge = edges.find(e => e.relationship_type === 'spouse' && (e.from_node_id === person.id || e.to_node_id === person.id));
      let spouse: Person | undefined = undefined;
      if (spouseEdge) {
        const spouseId = spouseEdge.from_node_id === person.id ? spouseEdge.to_node_id : spouseEdge.from_node_id;
        spouse = members.find(m => m.id === spouseId);
        if (spouse) processedIds.add(spouse.id);
      }

      // Find children
      const childEdges = getChildrenEdges(person.id);
      const spouseChildEdges = spouse ? getChildrenEdges(spouse.id) : [];
      
      // Merge unique children
      const uniqueChildIds = new Set([...childEdges.map(e => e.to_node_id), ...spouseChildEdges.map(e => e.to_node_id)]);
      const children: TreeNode[] = [];
      
      uniqueChildIds.forEach(childId => {
        if (!processedIds.has(childId)) {
          const childPerson = members.find(m => m.id === childId);
          if (childPerson) {
            children.push(buildNode(childPerson));
          }
        }
      });

      // Find other edges (cousin, godparent, etc) for this node to display in UI if needed
      const otherEdges = edges.filter(e => 
        (e.from_node_id === person.id || e.to_node_id === person.id) && 
        !['parent_child', 'spouse'].includes(e.relationship_type)
      );

      return {
        name: person.id,
        attributes: {
          primary: person,
          spouse: spouse,
          otherEdges
        },
        children
      };
    };

    const forest = startingNodes.filter(n => !processedIds.has(n.id)).map(r => buildNode(r));

    return {
      name: 'SuperRoot',
      attributes: { isSuperRoot: true },
      children: forest
    };
  }, [members, edges]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await compressImage(file);
      setUploadDataUrl(dataUrl);
    } catch(err) {
      console.error(err);
      alert('Failed to process image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    // Construct the payload based on Request Type
    let proposedData: any = {};
    
    if (requestType === 'new_node') {
      proposedData = {
        node: {
          full_name: formData.get('new_relative_name'),
          birth_year: formData.get('new_relative_birth'),
          death_year: isDeceasedForm ? formData.get('new_relative_death') : null,
          is_deceased: isDeceasedForm,
          photo_url: uploadDataUrl || null,
          bio: formData.get('bio'),
          contact_info: formData.get('contact_info')
        },
        edges: []
      };

      // Connect it to the target node
      if (selectedPerson) {
        const type = connectionType === 'other' ? customConnection : connectionType;
        proposedData.edges.push({
          target_node_id: selectedPerson.id,
          relationship_type: type
        });
      }
    } else {
      // Edit mode: proposing changes to the selected node
      proposedData = {
        edit_target_id: selectedPerson?.id,
        changes: {}
      };
      const name = formData.get('edit_name');
      const birth = formData.get('edit_birth');
      const death = isDeceasedForm ? formData.get('edit_death') : null;
      const bio = formData.get('bio');
      const contact = formData.get('contact_info');

      if (name) proposedData.changes.full_name = name;
      if (birth) proposedData.changes.birth_year = birth;
      if (isDeceasedForm !== undefined) proposedData.changes.is_deceased = isDeceasedForm;
      if (death) proposedData.changes.death_year = death;
      if (bio) proposedData.changes.bio = bio;
      if (contact) proposedData.changes.contact_info = contact;
      if (uploadDataUrl) proposedData.changes.photo_url = uploadDataUrl;
    }

    const data = {
      request_type: requestType,
      target_node_id: selectedPerson?.id || null,
      submitter_info: {
        name: formData.get('submitter_name'),
        email: formData.get('submitter_email'),
        phone: formData.get('submitter_phone'),
        relationship: formData.get('submitter_relationship')
      },
      proposed_data: proposedData,
      status: 'pending'
    };

    try {
      const { error } = await supabase.from('family_tree_requests').insert([data]);
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert('Failed to submit: ' + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatName = (fullName: string) => {
    if (!fullName) return { first: '', last: '' };
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return { first: parts[0], last: '' };
    const last = parts.pop();
    const first = parts.join(' ');
    return { first, last };
  };

  const renderCustomNodeElement = ({ nodeDatum }: any) => {
    if (nodeDatum.attributes?.isSuperRoot) return <g></g>; 

    if (nodeDatum.attributes?.isEmptyState) {
      return (
        <g className="cursor-pointer" transform="translate(-50, -70)" onClick={() => {
          setSelectedPerson(null);
          setRequestType('new_node');
          setUploadDataUrl(null);
          setShowModal(true);
        }}>
          <foreignObject width="100" height="140" x="0" y="0">
             <div className="w-[100px] h-[140px] bg-white rounded-[16px] shadow-md border border-stone-100 flex flex-col items-center justify-center text-center p-2 hover:shadow-lg transition">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <span className="text-primary text-xl font-bold">+</span>
                </div>
                <p className="text-[11px] font-bold text-stone-700 leading-tight">Start Tree</p>
             </div>
          </foreignObject>
        </g>
      );
    }

    const { primary, spouse } = nodeDatum.attributes;
    const hasSpouse = !!spouse;
    const primaryX = hasSpouse ? -110 : -50;
    const spouseX = 10;
    
    const maleSilhouette = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23B2CBBF'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23486358'/%3E%3Cpath d='M20 100 Q 50 60 80 100' fill='%23486358'/%3E%3C/svg%3E";
    const femaleSilhouette = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23E8B6A5'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23A15444'/%3E%3Cpath d='M20 100 Q 50 60 80 100' fill='%23A15444'/%3E%3C/svg%3E";

    const getSilhouette = (gender?: string) => {
      if (gender?.toLowerCase() === 'female') return femaleSilhouette;
      return maleSilhouette; // fallback
    };

    const renderCard = (person: any, x: number) => {
      const { first, last } = formatName(person.full_name);
      const isDeceasedDB = person.is_deceased !== false; 
      
      return (
        <foreignObject width="100" height="150" x={x} y="-75" onClick={() => {
            setSelectedPerson(person);
            setRequestType('new_node');
            setConnectionType('child');
            setUploadDataUrl(null);
            setShowModal(true);
        }}>
          <div className="w-[100px] h-[140px] bg-white rounded-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-[#ecece9] flex flex-col items-center justify-start overflow-visible cursor-pointer hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-shadow relative">
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#4c9d4b] rounded-full border-[2.5px] border-white flex items-center justify-center z-10 shadow-sm">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.5 1.45 4.73 3.73 6.13L5 20l3.43-1.42C9.57 18.85 10.76 19 12 19c5.52 19 10-15.42 10-11S17.52 2 12 2z"/></svg>
            </div>
            
            <div className="w-full h-[65px] bg-gradient-to-b from-[#f4f4f4] to-white rounded-t-[12px] flex items-center justify-center relative border-b border-transparent">
              <img src={person.photo_url || getSilhouette(person.gender)} className="w-[56px] h-[56px] rounded-full object-cover shadow-sm mt-3 bg-[#e2e8f0]" alt={person.full_name} />
            </div>
            
            <div className="w-full mt-4 px-1 text-center flex flex-col items-center flex-1">
              <p className="text-[11px] leading-[1.2] text-[#2c2c2c] w-full px-1 break-words line-clamp-2">
                {first} <br/><span className="font-bold">{last}</span>
              </p>
              <p className="text-[9px] text-[#717171] mt-[2px] whitespace-nowrap">
                {person.birth_year || '?'}–{!isDeceasedDB ? 'Present' : (person.death_year || '')}
              </p>
            </div>
          </div>
        </foreignObject>
      );
    };

    return (
      <g>
        {renderCard(primary, primaryX)}
        {hasSpouse && renderCard(spouse, spouseX)}
        {hasSpouse && (
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#cbd5e1" strokeWidth="1.5" />
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full h-full min-h-[75vh]">
      {loading ? (
        <div className="w-full h-[500px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="w-full h-[75vh] md:h-[800px] cursor-grab active:cursor-grabbing touch-none bg-[#FDFBF7]">
          <Tree
            data={treeData as any}
            orientation="vertical"
            pathFunc="step"
            zoom={zoomLevel}
            translate={translate}
            nodeSize={{ x: 180, y: 200 }}
            enableLegacyTransitions={true}
            transitionDuration={400}
            renderCustomNodeElement={renderCustomNodeElement}
          />
          
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <button onClick={() => setZoomLevel(z => Math.min(z + 0.2, 2))} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center font-bold text-stone-600 hover:text-primary transition-colors">+</button>
            <button onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.2))} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center font-bold text-stone-600 hover:text-primary transition-colors">-</button>
            <button onClick={() => {setZoomLevel(0.8); if(typeof window !== 'undefined') setTranslate({x: window.innerWidth/2, y: 150});}} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-xs font-bold text-stone-600 hover:text-primary transition-colors mt-2">Reset</button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
              className="bg-white w-full max-w-md h-full max-h-[90vh] md:max-h-screen md:h-screen shadow-2xl overflow-y-auto flex flex-col rounded-xl md:rounded-none z-10 relative"
            >
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50 sticky top-0 z-10">
                <h3 className="text-xl font-serif text-primary">
                  {selectedPerson ? `How are you related to ${selectedPerson.full_name}?` : 'Add Family Member'}
                </h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                {selectedPerson && (
                  <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-lg">
                    <button 
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition ${requestType === 'new_node' ? 'bg-white shadow-sm text-primary' : 'text-stone-500 hover:text-stone-700'}`}
                      onClick={() => setRequestType('new_node')}
                    >
                      Add Connection
                    </button>
                    <button 
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition ${requestType === 'edit_node' ? 'bg-white shadow-sm text-primary' : 'text-stone-500 hover:text-stone-700'}`}
                      onClick={() => {
                        setRequestType('edit_node');
                        setIsDeceasedForm(selectedPerson.is_deceased !== false);
                      }}
                    >
                      Suggest Edit
                    </button>
                  </div>
                )}

                {success ? (
                  <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center my-auto">
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
                    <p className="font-medium text-lg mb-2">Request Submitted Successfully</p>
                    <p className="text-sm mt-2 mb-6">Your submission is pending review by the family administrators. Thank you for contributing!</p>
                    <button 
                      onClick={() => {
                        setSuccess(false);
                        setUploadDataUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }} 
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition text-sm font-medium"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* NEW NODE MODE */}
                    {requestType === 'new_node' && selectedPerson && (
                      <div className="space-y-2 pb-4 border-b border-stone-100">
                        <label className="block text-sm font-bold text-stone-800 mb-1">Relationship Type *</label>
                        <select 
                          value={connectionType} 
                          onChange={(e) => setConnectionType(e.target.value)}
                          className="w-full px-3 py-3 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-primary/5 font-medium text-primary"
                        >
                          <option value="child">Child</option>
                          <option value="parent">Parent</option>
                          <option value="spouse">Spouse</option>
                          <option value="sibling">Sibling</option>
                          <option value="cousin">Cousin</option>
                          <option value="in-law">In-law</option>
                          <option value="godparent">Godparent</option>
                          <option value="other">Other...</option>
                        </select>
                        {connectionType === 'other' && (
                           <input required type="text" placeholder="Please specify..." value={customConnection} onChange={e => setCustomConnection(e.target.value)} className="w-full mt-2 px-3 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-primary" />
                        )}
                      </div>
                    )}

                    {requestType === 'new_node' && (
                      <div className="space-y-4 pb-4 border-b border-stone-100">
                        <h4 className="font-medium text-stone-800 text-lg">Details of Relative</h4>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Full Name *</label>
                          <input required name="new_relative_name" type="text" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                          <div className="flex gap-4 bg-stone-50 p-2 rounded-md border border-stone-200">
                            <label className="flex items-center gap-2 cursor-pointer px-2">
                              <input type="radio" name="is_deceased" checked={isDeceasedForm} onChange={() => setIsDeceasedForm(true)} className="text-primary focus:ring-primary" />
                              <span className="text-sm font-medium text-stone-700">Deceased</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer px-2">
                              <input type="radio" name="is_deceased" checked={!isDeceasedForm} onChange={() => setIsDeceasedForm(false)} className="text-primary focus:ring-primary" />
                              <span className="text-sm font-medium text-stone-700">Alive</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Birth Year/Date</label>
                            <input name="new_relative_birth" type="text" placeholder="YYYY" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                          {isDeceasedForm && (
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-stone-700 mb-1">Death Year/Date</label>
                              <input name="new_relative_death" type="text" placeholder="YYYY" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Bio / Memories (Optional)</label>
                          <textarea name="bio" rows={3} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Contact Info (Optional)</label>
                          <input name="contact_info" type="text" placeholder="Email, phone, or address" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>
                    )}

                    {/* EDIT NODE MODE */}
                    {requestType === 'edit_node' && selectedPerson && (
                      <div className="space-y-4 pb-4 border-b border-stone-100 bg-stone-50 p-4 rounded-md">
                        <h4 className="font-medium text-stone-800">Suggest Edits for {selectedPerson.full_name}</h4>
                        <p className="text-xs text-stone-500 mb-4">Only fill out fields you want to change.</p>
                        
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Corrected Name</label>
                          <input name="edit_name" type="text" defaultValue={selectedPerson.full_name} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer px-2">
                              <input type="radio" name="edit_is_deceased" checked={isDeceasedForm} onChange={() => setIsDeceasedForm(true)} className="text-primary focus:ring-primary" />
                              <span className="text-sm font-medium text-stone-700">Deceased</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer px-2">
                              <input type="radio" name="edit_is_deceased" checked={!isDeceasedForm} onChange={() => setIsDeceasedForm(false)} className="text-primary focus:ring-primary" />
                              <span className="text-sm font-medium text-stone-700">Alive</span>
                            </label>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Birth Year/Date</label>
                            <input name="edit_birth" type="text" defaultValue={selectedPerson.birth_year || ''} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                          {isDeceasedForm && (
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-stone-700 mb-1">Death Year/Date</label>
                              <input name="edit_death" type="text" defaultValue={selectedPerson.death_year || ''} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Update Bio</label>
                          <textarea name="bio" rows={3} defaultValue={selectedPerson.bio || ''} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Update Contact Info</label>
                          <input name="contact_info" type="text" defaultValue={selectedPerson.contact_info || ''} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pb-4 border-b border-stone-100">
                      <h4 className="font-medium text-stone-800 text-lg">{requestType === 'edit_node' ? 'New Photo' : 'Photo'}</h4>
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-stone-700">Upload Photo (Optional)</label>
                        <input 
                           type="file" 
                           accept="image/*"
                           capture="environment"
                           ref={fileInputRef}
                           onChange={handleImageUpload}
                           className="hidden"
                        />
                        <div className="flex items-center gap-4">
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-sm border border-stone-300 transition flex items-center gap-2">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                             {uploadingImage ? 'Processing...' : 'Choose File or Camera'}
                           </button>
                           {uploadDataUrl && <div className="w-12 h-12 rounded-full border-2 border-stone-200 shadow-sm overflow-hidden"><img src={uploadDataUrl} className="w-full h-full object-cover" /></div>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-stone-800 text-lg">Your Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          How are you related to the family? *
                        </label>
                        <input required name="submitter_relationship" type="text" placeholder="e.g. I am John's son" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Your Full Name *</label>
                        <input required name="submitter_name" type="text" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-stone-700 mb-1">Email (Optional)</label>
                          <input name="submitter_email" type="email" placeholder="For contact" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-stone-700 mb-1">Phone (Optional)</label>
                          <input name="submitter_phone" type="tel" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting || uploadingImage}
                      className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50 font-medium mt-6 text-lg"
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
