import logoUrl from '../assets/ikame-logo.png';

/** iKame mascot logo — import qua bundler để bản artifact nhúng được ảnh (không có file ngoài). */
export function BrandLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src={logoUrl}
      width={size}
      height={size}
      alt="iKame"
      className="brand-logo"
      draggable={false}
    />
  );
}
