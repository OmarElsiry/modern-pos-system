import React from 'react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: 'solid' | 'outline' | 'ghost' | 'glass' | 'danger' | 'default' | 'secondary' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'default' | 'icon';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}, ref) => {

  // Map legacy variants to Shadcn variants
  const mapVariant = (v: string): ShadcnButtonProps['variant'] => {
    switch (v) {
      case 'solid': return 'default';
      case 'danger': return 'destructive';
      case 'glass': return 'secondary';
      // keep shadcn variants if passed directly
      case 'default':
      case 'destructive':
      case 'outline':
      case 'secondary':
      case 'ghost':
      case 'link':
        return v as ShadcnButtonProps['variant'];
      default: return 'default';
    }
  };

  // Map legacy sizes to Shadcn sizes
  const mapSize = (s: string): ShadcnButtonProps['size'] => {
    switch (s) {
      case 'md': return 'default';
      // keep shadcn sizes
      case 'default':
      case 'sm':
      case 'lg':
      case 'icon':
        return s as ShadcnButtonProps['size'];
      default: return 'default';
    }
  };

  return (
    <ShadcnButton
      ref={ref}
      variant={mapVariant(variant)}
      size={mapSize(size)}
      className={cn(fullWidth && "w-full", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </ShadcnButton>
  );
});

Button.displayName = 'Button';

export default Button;
