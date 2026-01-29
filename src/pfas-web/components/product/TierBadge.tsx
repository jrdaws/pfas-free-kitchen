import { type VerificationTier, TIER_CONFIG } from '@/lib/types';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import styles from './TierBadge.module.css';

interface TierBadgeProps {
  tier: VerificationTier;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  showLabel?: boolean;
}

export function TierBadge({ 
  tier, 
  size = 'md', 
  showTooltip = true,
  showLabel = true,
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];

  const badge = (
    <Badge
      variant="tier"
      size={size}
      color={config.color}
      bgColor={config.bgColor}
      className={styles.badge}
    >
      <span className={styles.icon} aria-hidden="true">{config.icon}</span>
      {showLabel && <span className={styles.label}>{config.shortLabel}</span>}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip content={<TierTooltipContent tier={tier} config={config} />}>
      <span role="button" tabIndex={0} aria-label={`Tier ${tier}: ${config.label}`}>
        {badge}
      </span>
    </Tooltip>
  );
}

function TierTooltipContent({ 
  tier, 
  config 
}: { 
  tier: VerificationTier; 
  config: typeof TIER_CONFIG[VerificationTier];
}) {
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipHeader}>
        <span className={styles.tooltipIcon}>{config.icon}</span>
        <span className={styles.tooltipTier}>Tier {tier}</span>
      </div>
      <p className={styles.tooltipLabel}>{config.label}</p>
      <p className={styles.tooltipDesc}>{config.description}</p>
    </div>
  );
}
