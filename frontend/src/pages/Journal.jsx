import React from "react";

const articles = [
  {
    tag: "STYLE",
    title: "L'art de porter la transparence.",
    body: "Jelly redéfinit la silhouette du sac emblématique. Une lecture contemporaine qui joue avec la lumière, révèle le geste, invite au mouvement.",
    img: "https://customer-assets.emergentagent.com/job_nova-digital-maison/artifacts/g3nmvhgy_IMG_4150.jpeg",
  },
  {
    tag: "SAVOIR-FAIRE",
    title: "L'atelier de Milan.",
    body: "Chaque Jelly est façonné dans notre atelier milanais. Une précision héritée des grandes maisons italiennes, mise au service d'une modernité audacieuse.",
    img: "https://images.unsplash.com/photo-1779406275908-1dabe4083373?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBmYXNoaW9uJTIwbW9kZWwlMjBtaW5pbWFsaXN0fGVufDB8fHx8MTc4NDc1MjM3OXww&ixlib=rb-4.1.0&q=85",
  },
  {
    tag: "COLLECTION",
    title: "Neuf teintes, une manifeste.",
    body: "De l'ivoire cristallin au noir fumé, notre palette célèbre la diversité des saisons et des personnalités.",
    img: "https://images.unsplash.com/photo-1779406273777-38a6f61fb5fa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBmYXNoaW9uJTIwbW9kZWwlMjBtaW5pbWFsaXN0fGVufDB8fHx8MTc4NDc1MjM3OXww&ixlib=rb-4.1.0&q=85",
  },
];

export default function Journal() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16" data-testid="journal-page">
      <div className="mb-16 border-b border-black/10 pb-12">
        <p className="nova-eyebrow mb-4">JOURNAL — MAISON NOVA MILAN</p>
        <h1 className="nova-h1 text-5xl md:text-7xl">Chroniques d'une maison.</h1>
      </div>

      <div className="space-y-24">
        {articles.map((a, i) => (
          <article key={i} className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="aspect-[4/5] overflow-hidden bg-nova-soft"><img src={a.img} alt={a.title} className="w-full h-full object-cover nova-product-img" /></div>
            <div>
              <p className="nova-eyebrow mb-4">CHAPITRE {String(i + 1).padStart(2, "0")} — {a.tag}</p>
              <h2 className="nova-h2 text-4xl mb-6">{a.title}</h2>
              <p className="text-black/70 leading-relaxed">{a.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
