import { CirculoAmigosLanding } from "@/components/CirculoAmigosLanding";
import { CIRCULO_AMIGOS_IMAGE } from "@/lib/circulo-amigos-content";

export default function HomePage() {
  return (
    <div className="circulo-amigos-shell">
      <link
        rel="preload"
        as="image"
        href={CIRCULO_AMIGOS_IMAGE.src}
        fetchPriority="high"
      />
      <CirculoAmigosLanding />
    </div>
  );
}
