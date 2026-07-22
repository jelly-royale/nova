import React from "react";

export default function Maison() {
  return (
    <div data-testid="maison-page">
      <section className="relative h-[60vh] md:h-[75vh] overflow-hidden">
        <img src="https://images.pexels.com/photos/14916457/pexels-photo-14916457.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="La Maison NOVA MILAN" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/70" />
        <div className="relative z-10 h-full flex items-end max-w-[1400px] mx-auto px-6 lg:px-12 pb-12 md:pb-20 text-nova-ivory">
          <div>
            <p className="nova-eyebrow text-nova-gold">NOTRE MAISON</p>
            <h1 className="nova-h1 text-4xl md:text-6xl lg:text-7xl mt-4 max-w-3xl">Une maison. Un même geste : l'élégance.</h1>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 space-y-8 text-base md:text-lg leading-relaxed text-black/80">
        <p className="text-2xl md:text-3xl font-serif-display leading-snug text-black">
          NOVA MILAN est une maison digitale de luxe née de la rencontre entre l'élégance italienne, la créativité contemporaine et l'art de créer des pièces remarquables.
        </p>
        <p>
          Nous imaginons des accessoires où la tradition du beau geste dialogue avec la modernité. Chaque création est pensée comme une architecture — pure, sculpturale, désirable — capable de traverser les saisons et les styles.
        </p>
        <p>
          Notre signature, le sac <em>Jelly</em>, incarne cette vision : une silhouette héritée des grandes maisons italiennes, réinterprétée dans une matière contemporaine, translucide, précieuse. Une pièce qui joue avec la lumière et devient bien plus qu'un accessoire — une écriture personnelle.
        </p>
        <p>
          NOVA MILAN cultive une exigence : le raffinement dans chaque détail. Un service confidentiel, un packaging signature, une expérience pensée pour celles et ceux qui recherchent l'exclusivité et le caractère unique.
        </p>
        <p>
          Jeune maison portée par une ambition internationale, NOVA MILAN écrit un nouveau chapitre du luxe : plus libre, plus contemporain, sans jamais renoncer à l'excellence.
        </p>
      </section>

      <section className="bg-nova-soft py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <p className="nova-eyebrow mb-4">NOS VALEURS</p>
          <h2 className="nova-h2 text-3xl md:text-5xl mb-12">L'excellence, cousue main.</h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { t: "Élégance intemporelle", d: "Des silhouettes pensées pour durer, au-delà des saisons et des tendances." },
              { t: "Attention aux détails", d: "Chaque couture, chaque ferrure, chaque finition est un serment de qualité." },
              { t: "Vision internationale", d: "Milano, Paris, London — une même exigence, une même signature." },
              { t: "Savoir-faire", d: "Un héritage de maroquinerie italienne au service d'une modernité audacieuse." },
              { t: "Exclusivité", d: "Une expérience client confidentielle, un accompagnement sur-mesure." },
              { t: "Confiance", d: "La qualité s'éprouve avec le temps. Nos pièces sont conçues pour vous accompagner longtemps." },
            ].map((v, i) => (
              <div key={i} className="border-t border-black/10 pt-6">
                <p className="font-serif-display text-xl md:text-2xl mb-3">{v.t}</p>
                <p className="text-sm text-black/60 leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
