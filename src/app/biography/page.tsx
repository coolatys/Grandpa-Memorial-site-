import { supabase } from '@/lib/supabase';

export const revalidate = 60; // Revalidate every minute

export default async function BiographyPage() {
  const { data: sections } = await supabase
    .from('biography_sections')
    .select('*')
    .order('sort_order', { ascending: true });

  const displaySections = sections && sections.length > 0 ? sections : [
    { id: '1', heading: 'Early Life', body: 'Grandpa was born in a small town...', sort_order: 1 },
    { id: '2', heading: 'Career', body: 'He dedicated 40 years to his profession...', sort_order: 2 }
  ];

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-serif text-center mb-12 text-primary">Biography</h1>
      
      <div className="space-y-16">
        {displaySections.map((section) => (
          <section key={section.id} className="prose prose-stone lg:prose-lg mx-auto">
            <h2 className="text-2xl font-serif text-accent mb-4">{section.heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: section.body }} className="text-stone-700 leading-relaxed" />
          </section>
        ))}
      </div>
    </div>
  );
}
