export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-medium transition-all duration-200 select-none ' +
  'disabled:pointer-events-none disabled:opacity-50 motion-safe:active:scale-[0.97]';

const variants: Record<ButtonVariant, string> = {
  // Action principale : émeraude avec halo, reflet qui glisse au survol.
  primary:
    'group bg-primary font-bold text-primary-foreground shadow-[0_0_28px_rgb(var(--primary)/0.3)] hover:shadow-[0_0_44px_rgb(var(--primary)/0.5)] motion-safe:hover:-translate-y-0.5 ' +
    "before:absolute before:inset-y-0 before:-left-full before:w-1/2 before:-skew-x-12 before:bg-white/25 before:content-[''] motion-safe:hover:before:translate-x-[400%] before:transition-transform before:duration-700",
  secondary: 'border border-border bg-card/60 text-foreground hover:border-brand hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  danger: 'bg-destructive font-bold text-background hover:bg-destructive/90',
};

// Cibles tactiles : 44 px minimum sur mobile, un peu plus compact sur grand écran pour « sm ».
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm sm:min-h-9 sm:px-3.5 sm:text-[13px]',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-7 text-sm sm:text-base',
};

export function buttonClasses(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  extra = '',
) {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}
