/** iKame mascot logo — served from public/ikame-logo.png (also used as favicon). */
export function BrandLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/ikame-logo.png"
      width={size}
      height={size}
      alt="iKame"
      className="brand-logo"
      draggable={false}
    />
  );
}
