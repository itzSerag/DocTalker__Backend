import React from "react";

type BadgeVariant = "brand" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: "badge-brand",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  neutral: "badge-neutral",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  icon,
  className = "",
}) => (
  <span className={`badge ${variantClasses[variant]} ${className}`}>
    {icon && <span className="shrink-0">{icon}</span>}
    {children}
  </span>
);

export default Badge;
