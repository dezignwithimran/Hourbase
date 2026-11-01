import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-blue-600 text-white shadow-[0_1px_2px_rgba(15,23,42,.12),0_8px_22px_rgba(37,99,235,.18)] hover:bg-blue-700 hover:-translate-y-0.5",
  secondary:
    "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  dark: "bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800 hover:-translate-y-0.5",
};

const sizes = {
  sm: "h-10 rounded-lg px-4 text-sm",
  md: "h-11 rounded-[10px] px-5 text-sm",
  lg: "h-12 rounded-xl px-6 text-[15px]",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
} = {}) {
  return cn(
    "inline-flex touch-manipulation items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button(props) {
  const { children, className, variant = "primary", size = "md" } = props;
  const classes = buttonStyles({ variant, size, className });

  if (props.href) {
    const { href, children: _children, className: _className, variant: _variant, size: _size, ...rest } = props;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const {
    children: _children,
    className: _className,
    variant: _variant,
    size: _size,
    ...buttonProps
  } = props;

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
