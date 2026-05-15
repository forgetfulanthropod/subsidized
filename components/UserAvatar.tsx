import Image from "next/image";
import { cn } from "@/lib/utils";

export function UserAvatar({
  src,
  alt,
  size = 36,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={cn(
        "shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover",
        className
      )}
    />
  );
}
