'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends React.ComponentProps<typeof Image> {
  className?: string
}

export function OptimizedImage({ className, alt, ...props }: OptimizedImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        {...props}
        alt={alt}
        quality={90}
        className={cn('object-cover', className)}
      />
    </div>
  )
} 