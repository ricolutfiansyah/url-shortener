import { JSX, splitProps } from 'solid-js';

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, ['variant', 'size', 'class', 'children']);
  
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    danger: "bg-red-900 text-red-100 hover:bg-red-900/90",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-11 rounded-md px-8",
  };

  const variantClass = variants[local.variant || 'primary'];
  const sizeClass = sizes[local.size || 'md'];
  
  return (
    <button
      class={`${baseClasses} ${variantClass} ${sizeClass} ${local.class || ''}`}
      {...others}
    >
      {local.children}
    </button>
  );
}
