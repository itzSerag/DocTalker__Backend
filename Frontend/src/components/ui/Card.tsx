import React from "react";

type CardVariant = "default" | "raised" | "interactive";

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default: "card",
  raised: "card-raised",
  interactive: "card-interactive",
};

export const Card: React.FC<CardProps> = ({
  variant = "default",
  children,
  className = "",
  onClick,
  padding = true,
}) => (
  <div
    className={[variantClasses[variant], padding ? "p-5" : "", className]
      .filter(Boolean)
      .join(" ")}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {children}
  </div>
);

export default Card;
