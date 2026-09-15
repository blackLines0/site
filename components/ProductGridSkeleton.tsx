// Placeholder cards shaped like a real product card, shown in a `.products`
// grid while a filter/sort change is in flight — keeps the grid's height so
// the page doesn't collapse to nothing and jump the scroll position.
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skel-card" key={i}>
          <div className="skel-img" />
          <div className="skel-line sm" />
          <div className="skel-line md" />
          <div className="skel-line lg" />
        </div>
      ))}
    </>
  );
}
