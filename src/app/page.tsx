import Hero from '@/components/Hero';

export default function Home() {
  return (
    <>
      <Hero />
      <section className="py-24 px-4 bg-stone-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-primary mb-6">A Life Well Lived</h2>
          <p className="text-lg text-stone-600 leading-relaxed mb-8">
            Welcome to the digital memorial for our beloved grandfather. This site serves as a place to share memories, trace our roots, and celebrate his extraordinary journey.
          </p>
        </div>
      </section>
    </>
  );
}
