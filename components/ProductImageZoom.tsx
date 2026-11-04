"use client";

import { useRef, useState } from "react";
import { cldUrl } from "@/lib/cloudinary";

const MIN_ZOOM = 2.5;

type ZoomView = {
  lens: { left: number; top: number; width: number; height: number };
  background: { width: number; height: number; x: number; y: number };
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ProductImageZoom({ src, alt }: { src: string; alt: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ZoomView | null>(null);
  const [loaded, setLoaded] = useState(false);

  function handleMouseMove(e: React.MouseEvent) {
    const frame = frameRef.current?.getBoundingClientRect();
    const pane = paneRef.current?.getBoundingClientRect();
    const image = imageRef.current;
    // The pane is display:none where there is no room beside the image.
    if (!frame || !pane?.width || !image?.naturalWidth) return;

    // Work from the drawn box: a height-capped image can sit inside the frame.
    const scale = Math.min(frame.width / image.naturalWidth, frame.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const offsetX = (frame.width - width) / 2;
    const offsetY = (frame.height - height) / 2;

    const pointerX = e.clientX - frame.left;
    const pointerY = e.clientY - frame.top;
    const onImage =
      pointerX >= offsetX && pointerX <= offsetX + width && pointerY >= offsetY && pointerY <= offsetY + height;
    if (!onImage) {
      setView(null);
      return;
    }

    // Raised above MIN_ZOOM when needed so a wide image still fills the pane.
    const zoom = Math.max(MIN_ZOOM, pane.width / width, pane.height / height);
    const lensWidth = pane.width / zoom;
    const lensHeight = pane.height / zoom;
    const lensX = clamp(pointerX - lensWidth / 2 - offsetX, 0, width - lensWidth);
    const lensY = clamp(pointerY - lensHeight / 2 - offsetY, 0, height - lensHeight);

    setView({
      lens: { left: offsetX + lensX, top: offsetY + lensY, width: lensWidth, height: lensHeight },
      background: { width: width * zoom, height: height * zoom, x: -lensX * zoom, y: -lensY * zoom },
    });
  }

  return (
    <div className="gallery-stage">
      <div
        className={`gallery-main${loaded ? "" : " gallery-placeholder skel-block"}`}
        ref={frameRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setView(null)}
      >
        <img ref={imageRef} src={cldUrl(src, 1100)} alt={alt} onLoad={() => setLoaded(true)} />
        {view ? <div className="zoom-lens" style={view.lens} /> : null}
        <div className="corner" />
      </div>
      <div
        className="zoom-pane"
        ref={paneRef}
        aria-hidden="true"
        style={
          view
            ? {
                visibility: "visible",
                // The 1100px image already cached shows until the larger one arrives.
                backgroundImage: `url("${cldUrl(src, 2000)}"), url("${cldUrl(src, 1100)}")`,
                backgroundSize: `${view.background.width}px ${view.background.height}px`,
                backgroundPosition: `${view.background.x}px ${view.background.y}px`,
              }
            : undefined
        }
      />
    </div>
  );
}
