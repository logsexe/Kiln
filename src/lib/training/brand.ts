const BRANDS = [
  "Life fitness",
  "Nautilus nitro plus",
  "Nautilus",
  "Newtech ONHIM",
  "Newtech",
  "Glute builder",
  "Max pump",
  "Pit shark",
  "Mega mass",
  "Prime",
  "Gymleco",
  "Atlantis",
  "Watson",
  "Rodgers",
  "Hoist",
  "Barbell",
  "Dumbbells",
  "Dumbbell",
  "Outdoor or treadmill",
  "Outdoor",
  "Treadmill",
  "Bike",
  "Rower",
  "Ski erg",
];

export function splitKit(kit: string): { brand: string; rest: string } {
  const hit = BRANDS.find((brand) => kit.toLowerCase().startsWith(brand.toLowerCase()));
  if (!hit) return { brand: kit, rest: "" };
  const rest = kit.slice(hit.length).replace(/^[\s·/-]+/, "");
  return { brand: hit, rest };
}
