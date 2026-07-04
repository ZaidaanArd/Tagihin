import Image from "next/image";

type LogoProps = {
  width?: number;
  className?: string;
};

export function Logo({ width = 160, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Tagihin"
      width={width}
      height={0}
      className={className}
      style={{ height: "auto", mixBlendMode: "multiply" }}
      priority
    />
  );
}
