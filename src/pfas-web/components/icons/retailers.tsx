/**
 * Retailer Icons for PFAS-Free Kitchen
 * 
 * Simple, consistent brand-neutral icons for retailer links.
 * Using simplified representations rather than exact logos for trademark compliance.
 */

import { type SVGProps } from 'react';

export interface RetailerIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

const defaultProps = {
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/**
 * Amazon - Stylized shopping cart with smile
 */
export function AmazonIcon({ size = 24, className, ...props }: RetailerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      {/* Simplified A shape */}
      <path
        d="M4 17c3.5 2.5 9 3.5 14 1"
        stroke="#FF9900"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrow */}
      <path
        d="M16 14l2 4 2-1"
        stroke="#FF9900"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* A letterform */}
      <path
        d="M7 14l5-10 5 10M9 10h6"
        stroke="#232F3E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Target - Bullseye target
 */
export function TargetIcon({ size = 24, className, ...props }: RetailerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="#CC0000" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="6" stroke="#CC0000" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" fill="#CC0000" />
    </svg>
  );
}

/**
 * Walmart - Spark icon representation
 */
export function WalmartIcon({ size = 24, className, ...props }: RetailerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      {/* Six-point spark */}
      <g stroke="#0071CE" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <line x1="12" y1="2" x2="12" y2="7" />
        <line x1="12" y1="17" x2="12" y2="22" />
        <line x1="3.5" y1="7" x2="7.5" y2="10" />
        <line x1="16.5" y1="14" x2="20.5" y2="17" />
        <line x1="3.5" y1="17" x2="7.5" y2="14" />
        <line x1="16.5" y1="10" x2="20.5" y2="7" />
      </g>
    </svg>
  );
}

/**
 * Williams Sonoma - Stylized W with pan
 */
export function WilliamsSonomaIcon({ size = 24, className, ...props }: RetailerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      {...defaultProps}
      {...props}
    >
      {/* Pan silhouette */}
      <ellipse cx="12" cy="14" rx="7" ry="4" strokeWidth="2" fill="none" />
      <path d="M19 14h3" strokeWidth="2" />
      {/* W */}
      <path d="M6 6l2 6 2-4 2 4 2-6" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/**
 * Sur La Table - Stylized table with plate
 */
export function SurLaTableIcon({ size = 24, className, ...props }: RetailerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      {...defaultProps}
      {...props}
    >
      {/* Table top */}
      <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" />
      {/* Plate on table */}
      <circle cx="12" cy="8" r="4" strokeWidth="1.5" fill="none" />
      {/* Table legs */}
      <line x1="6" y1="12" x2="6" y2="20" strokeWidth="2" />
      <line x1="18" y1="12" x2="18" y2="20" strokeWidth="2" />
    </svg>
  );
}

/**
 * Crate & Barrel - Box/crate icon
 */
export function CrateBarrelIcon({ size = 24, className, ...props }: RetailerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      {...defaultProps}
      {...props}
    >
      {/* Crate */}
      <rect x="4" y="8" width="16" height="12" rx="1" strokeWidth="2" fill="none" />
      {/* Slats */}
      <line x1="4" y1="12" x2="20" y2="12" strokeWidth="1.5" />
      <line x1="4" y1="16" x2="20" y2="16" strokeWidth="1.5" />
      {/* Open top flap */}
      <path d="M4 8l4-4h8l4 4" strokeWidth="2" fill="none" />
    </svg>
  );
}

/**
 * Brand Direct / External Link
 */
export function BrandDirectIcon({ size = 24, className, ...props }: RetailerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      {...defaultProps}
      {...props}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/**
 * Generic Shopping Cart Icon
 */
export function ShoppingCartIcon({ size = 24, className, ...props }: RetailerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      {...defaultProps}
      {...props}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

/**
 * Get the appropriate icon component for a retailer
 */
export function getRetailerIcon(retailerId: string, size: number = 24) {
  const icons: Record<string, React.FC<RetailerIconProps>> = {
    ret_amazon: AmazonIcon,
    ret_target: TargetIcon,
    ret_walmart: WalmartIcon,
    ret_williams_sonoma: WilliamsSonomaIcon,
    ret_sur_la_table: SurLaTableIcon,
    ret_crate_barrel: CrateBarrelIcon,
    ret_direct: BrandDirectIcon,
  };

  const IconComponent = icons[retailerId] || ShoppingCartIcon;
  return <IconComponent size={size} />;
}

/**
 * Retailer Icon by ID - Component version
 */
export function RetailerIcon({ 
  retailerId, 
  size = 24, 
  className 
}: { 
  retailerId: string; 
  size?: number; 
  className?: string;
}) {
  const icons: Record<string, React.FC<RetailerIconProps>> = {
    ret_amazon: AmazonIcon,
    ret_target: TargetIcon,
    ret_walmart: WalmartIcon,
    ret_williams_sonoma: WilliamsSonomaIcon,
    ret_sur_la_table: SurLaTableIcon,
    ret_crate_barrel: CrateBarrelIcon,
    ret_direct: BrandDirectIcon,
  };

  const IconComponent = icons[retailerId] || ShoppingCartIcon;
  return <IconComponent size={size} className={className} />;
}
