import React, { useCallback } from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size' | 'onChange'> {
  label?: string;
  value?: string | number | readonly string[];
  onChange?: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  variant?: 'solid' | 'outline' | 'glass' | 'ghost'; // Legacy props kept for compatibility
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

const Input: React.FC<InputProps> = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  value,
  onChange,
  type = 'text',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  size,
  fullWidth = false,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  containerStyle,
  disabled,
  required,
  ...props
}, ref) => {

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  }, [onChange]);

  return (
    <div
      className={cn("flex flex-col gap-1.5", fullWidth && "w-full", className)}
      style={containerStyle}
    >
      {label && (
        <Label className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <ShadcnInput
          ref={ref}
          type={type}
          disabled={disabled}
          required={required}
          value={value}
          onChange={handleChange}
          className={cn(
            leftIcon ? "pl-9" : "",
            rightIcon ? "pr-9" : "",
            error ? "border-destructive focus-visible:ring-destructive" : ""
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={cn("text-xs text-muted-foreground", error && "text-destructive")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
