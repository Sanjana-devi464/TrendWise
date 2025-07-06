import Image from 'next/image';
import { User } from 'lucide-react';
import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-8 h-8',
};

export default function Avatar({ src, alt = 'User avatar', size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const baseClasses = `${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-sm ${className}`;

  if (src && !imageError) {
    return (
      <div className={baseClasses}>
        <Image
          src={src}
          alt={alt}
          width={size === 'xl' ? 64 : size === 'lg' ? 40 : size === 'md' ? 32 : 24}
          height={size === 'xl' ? 64 : size === 'lg' ? 40 : size === 'md' ? 32 : 24}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          unoptimized={src.startsWith('data:')} // For base64 images
        />
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center`}>
      <User className={`${iconSizes[size]} text-white`} />
    </div>
  );
}
