const money = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });
// Nazwy odpowiadają polu dishes.name zwracanemu przez API.
const dishPhotos = {
  Bruschetta: { file: "bruschetta.jpg", alt: "Bruschetta z pomidorami i zieleniną na czarnym talerzu" },
  Caprese: { file: "caprese.jpg", alt: "Pomidory, mozzarella i bazylia na drewnianej desce" },
  Oliwki: { file: "oliwki.jpg", alt: "Miseczka zielonych oliwek" },
  Margherita: { file: "margherita.jpg", alt: "Pizza Margherita z mozzarellą i bazylią" },
  Salame: { file: "salame.jpg", alt: "Pizza z salami, oliwkami i bazylią" },
  Funghi: { file: "funghi.jpg", alt: "Pizza z grzybami na drewnianym stole" },
  Ortolana: { file: "ortolana.jpg", alt: "Pizza z pieczarkami, papryką, cukinią i oliwkami" },
  Capriciosa: { file: "capriciosa.jpg", alt: "Pizza z szynką, grzybami, karczochami i bazylią na drewnianej desce" },
  Diablo: { file: "diablo.jpg", alt: "Pizza z salami i papryczkami jalapeño na ciemnym stole" },
  Fiore: { file: "fiore.jpg", alt: "Pizza z sosem pesto, mozzarellą i pomidorkami" },
  Gyros: { file: "gyros.jpg", alt: "Pizza z mięsem gyros, czerwoną cebulą i papryką" },
  Hawai: { file: "hawai.jpg", alt: "Pizza z szynką, ananasem i bazylią na drewnianej desce" },
  Peperoni: { file: "peperoni.jpg", alt: "Pizza z plastrami peperoni i mozzarellą" },
  Prosciutto: { file: "prosciutto.jpg", alt: "Pizza z szynką prosciutto, bakłażanem i mozzarellą", position: "50% 75%" },
  Spinaci: { file: "spinaci.jpg", alt: "Pizza ze szpinakiem, kukurydzą i czarnymi oliwkami na drewnianej desce" },
  Torino: { file: "torino.jpg", alt: "Pizza z szynką dojrzewającą, rukolą, parmezanem i czarnymi oliwkami" },
  Tiramisu: { file: "tiramisu.jpg", alt: "Porcja tiramisu posypana kakao" },
  "Panna cotta": { file: "panna_cotta.jpg", alt: "Panna cotta z sosem owocowym na białym talerzu", position: "50% 65%" },
  Lemoniada: { file: "lemoniada.jpg", alt: "Szklanka lemoniady z cytryną i słomką" },
  Espresso: { file: "espresso.jpg", alt: "Filiżanka espresso trzymana w dłoni", position: "50% 65%" },
  Woda: { file: "woda.jpg", alt: "Szklanka wody z lodem na stole", position: "50% 65%" },
};

export default function DishCard({ dish }) {
  const photo = dishPhotos[dish.name];
  return <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
    {photo && <img src={`/images/menu/${photo.file}`} alt={photo.alt}
      className="aspect-[4/3] w-full object-cover" style={{ objectPosition: photo.position }} />}
    <div className="p-5">
      <div className="flex justify-between gap-4"><h4 className="font-semibold">{dish.name}</h4><span className="shrink-0 font-semibold text-orange-900">{money.format(dish.price_grosz / 100)}</span></div>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{dish.description}</p>
    </div>
  </article>;
}
