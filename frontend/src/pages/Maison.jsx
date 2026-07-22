import React from "react";

export default function Maison() {
  return (
    <div data-testid="maison-page">
      <section className="relative h-[70vh] overflow-hidden">
        <img src="https://images.pexels.com/photos/14916457/pexels-photo-14916457.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="La Maison NOVA MILAN" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        <div className="relative z-10 h-full flex items-end max-w-[1400px] mx-auto px-6 lg:px-12 pb-20 text-nova-ivory">
          <div>
            <p className="nova-eyebrow text-nova-gold">NOTRE MAISON</p>
            <h1 className="nova-h1 text-5xl md:text-7xl mt-4 max-w-3xl">Une nouvelle maison. Un même geste : l'élégance.</h1>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 space-y-8 text-lg leading-relaxed text-black/80">
        <p><span className="font-serif-display text-3xl">NOVA MILAN</span> est une maison de maroquinerie contemporaine, née de la rencontre entre la précision italienne, l'architecture de Milan et le raffinement parisien.</p>
        <p>Nous croyons qu'un sac n'est jamais un simple accessoire. C'est une pièce de style qui accompagne les moments qui comptent — un signe, une signature, une manière d'être.</p>
        <p>Chaque création NOVA MILAN puise dans le meilleur de la tradition du luxe et dans une lecture résolument moderne du présent. Nos silhouettes se distinguent par leur pureté architecturale, leurs proportions équilibrées et l'attention méticuleuse portée à chaque détail.</p>
        <p>NOVA MILAN est une jeune maison en développement, portée par une ambition internationale. Nous imaginons des pièces pensées pour durer, désirables au-delà des tendances, et destinées à celles et ceux qui recherchent l'élégance, la confiance et le caractère unique.</p>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 grid md:grid-cols-3 gap-12 border-t border-black/10">
        {[
          { t: "Élégance intemporelle", d: "Des pièces qui traversent les saisons." },
          { t: "Attention aux détails", d: "Un travail précis, cousu main, jusqu'au moindre point." },
          { t: "Vision internationale", d: "Milano, Paris, London — une même exigence." },
        ].map((v, i) => (
          <div key={i}>
            <p className="font-serif-display text-2xl mb-3">{v.t}</p>
            <p className="text-sm text-black/60">{v.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
