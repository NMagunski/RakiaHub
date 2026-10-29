import Image from "next/image";

type Product = {
  name: string;
  fruit: string | null;
  image_url?: string | null;
  image_rights?: string | null;
  image_source?: string | null;
  image_attribution?: string | null;
};
type Props = { product: Product; className?: string; sizes?: string; priority?: boolean; landscape?: boolean };
const ARTWORK: Record<string, { file: string; label: string }> = {
  plum: { file: "plum", label: "сливи" },
  grape: { file: "grape", label: "грозде" },
  apricot: { file: "apricot", label: "кайсии" },
  pear: { file: "pear", label: "круши" },
  quince: { file: "quince", label: "дюли" },
  fig: { file: "fig", label: "смокини" },
  mixed: { file: "mixed", label: "смесени плодове" },
  other: { file: "neutral", label: "ботанически детайли" },
};

export default function ProductArtwork({ product, className = "", sizes = "(max-width:640px) 50vw, 350px", priority = false, landscape = false }: Props) {
  if (product.image_url && product.image_rights && product.image_source) {
    return <figure className={`product-artwork licensed-artwork ${className}`}>
      <Image src={product.image_url} alt={product.name} fill sizes={sizes} priority={priority} className="object-contain" />
      <figcaption title={`Източник: ${product.image_source} · ${product.image_rights}`}>{product.image_attribution || "Продуктова снимка"}</figcaption>
    </figure>;
  }
  const artwork = ARTWORK[product.fruit || ""] || ARTWORK.other;
  const variant = landscape && ["plum", "grape", "apricot"].includes(artwork.file) ? "landscape" : "sketch";
  return <figure className={`product-artwork generated-artwork ${className}`}>
    <Image src={`/images/editorial/${artwork.file}-${variant}.png`} alt={`Авторска скица на обща бутилка и ${artwork.label}; не представя конкретния продукт`} fill sizes={sizes} priority={priority} className="object-cover" />
    <figcaption title="Авторска илюстрация, създадена с AI. Действителната бутилка може да изглежда различно.">Илюстрация</figcaption>
  </figure>;
}
