"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { getHeroSlides } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";

const FALLBACK_IMAGES = [
  "/hero/IMG_7749.JPG",
  "/hero/IMG_7751.JPG",
  "/hero/IMG_7753.JPG",
  "/hero/IMG_7754.JPG",
  "/hero/IMG_7755.JPG",
  "/hero/IMG_7757.JPG",
  "/hero/IMG_7761.JPG",
];

const ROTATE_INTERVAL_MS = 60_000;

interface Slide {
  image: string;
  tag: string;
}

export function HeroGallery() {
  const { data: fetched, isError } = useQuery({
    queryKey: queryKeys.heroSlides,
    queryFn: getHeroSlides,
  });
  const [active, setActive] = useState(0);

  const slides = useMemo<Slide[] | null>(() => {
    if (!fetched && !isError) return null;
    if (fetched?.length) {
      return fetched.map((s) => ({ image: s.image, tag: s.titre ?? "Nouvelle collection · Lomé" }));
    }
    return FALLBACK_IMAGES.map((image) => ({ image, tag: "Nouvelle collection · Lomé" }));
  }, [fetched]);

  useEffect(() => {
    if (!slides || slides.length < 2) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(id);
  }, [slides]);

  if (!slides) {
    return <div className="hero-gallery" aria-hidden="true" />;
  }

  return (
    <div className="hero-gallery">
      <div className="hero-gallery-main">
        <AnimatePresence>
          <motion.img
            key={active}
            src={slides[active].image}
            alt="Blacklines, collection en vitrine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AnimatePresence>
        <span className="tag">{slides[active].tag}</span>
      </div>
      {slides.length > 1 ? (
        <div className="hero-gallery-strip">
          {slides.map((slide, i) => (
            <div
              key={`${slide.image}-${i}`}
              className={`hero-gallery-thumb${i === active ? " active" : ""}`}
              onMouseEnter={() => setActive(i)}
            >
              <img src={slide.image} alt="" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
