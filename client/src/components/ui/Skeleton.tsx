import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton = ({
  width,
  height,
  circle = false,
  className = '',
  style,
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={`bg-white/[0.06] animate-pulse ${
        circle ? 'rounded-full' : 'rounded-xl'
      } ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};
