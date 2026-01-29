'use client';

import { useState } from 'react';
import styles from './ComponentDiagram.module.css';

interface Component {
  id: string;
  name: string;
  foodContact: boolean;
  material: string;
  coating?: string;
  status: 'verified' | 'partial' | 'unknown';
  description: string;
}

const DEFAULT_COMPONENTS: Component[] = [
  {
    id: 'surface',
    name: 'Cooking Surface',
    foodContact: true,
    material: 'Hard-anodized aluminum',
    coating: 'Ceramic non-stick',
    status: 'verified',
    description: 'Primary food contact surface. Lab tested for PFAS content.',
  },
  {
    id: 'body',
    name: 'Pan Body',
    foodContact: true,
    material: 'Aluminum',
    status: 'verified',
    description: 'Interior walls that may contact food. Verified PFAS-free.',
  },
  {
    id: 'rivets',
    name: 'Rivets',
    foodContact: true,
    material: 'Stainless steel',
    status: 'verified',
    description: 'Attachment points for handle. Inherently PFAS-free.',
  },
  {
    id: 'handle',
    name: 'Handle',
    foodContact: false,
    material: 'Stainless steel with silicone grip',
    status: 'partial',
    description: 'Does not contact food directly. Silicone grip may contain PFAS.',
  },
  {
    id: 'lid',
    name: 'Lid',
    foodContact: true,
    material: 'Tempered glass with silicone rim',
    status: 'partial',
    description: 'Glass is PFAS-free. Silicone rim may contact food when inverted.',
  },
];

interface ComponentDiagramProps {
  components?: Component[];
  showLegend?: boolean;
  interactive?: boolean;
}

export function ComponentDiagram({ 
  components = DEFAULT_COMPONENTS, 
  showLegend = true,
  interactive = true 
}: ComponentDiagramProps) {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const getStatusColor = (status: Component['status']) => {
    switch (status) {
      case 'verified': return 'var(--color-green-500)';
      case 'partial': return 'var(--color-yellow-500)';
      case 'unknown': return 'var(--color-gray-400)';
    }
  };

  const getStatusLabel = (status: Component['status']) => {
    switch (status) {
      case 'verified': return 'Verified PFAS-Free';
      case 'partial': return 'Partially Verified';
      case 'unknown': return 'Unknown';
    }
  };

  const handleComponentClick = (id: string) => {
    if (interactive) {
      setActiveComponent(activeComponent === id ? null : id);
    }
  };

  const activeData = components.find(c => c.id === (activeComponent || hoveredComponent));

  return (
    <div className={styles.container}>
      <div className={styles.diagramWrapper}>
        {/* SVG Pan Diagram */}
        <svg 
          viewBox="0 0 400 220" 
          className={styles.diagram}
          aria-label="Interactive pan diagram showing verified components"
        >
          {/* Pan body outline */}
          <ellipse 
            cx="170" cy="180" rx="130" ry="30" 
            fill="var(--color-gray-200)"
            stroke="var(--color-gray-300)"
            strokeWidth="2"
          />
          
          {/* Pan interior/cooking surface */}
          <path 
            d="M40 180 Q40 100 170 100 Q300 100 300 180"
            fill="var(--color-gray-100)"
            stroke={activeComponent === 'surface' || hoveredComponent === 'surface' 
              ? 'var(--color-green-500)' 
              : 'var(--color-gray-400)'}
            strokeWidth={activeComponent === 'surface' || hoveredComponent === 'surface' ? 4 : 2}
            className={styles.interactiveArea}
            onClick={() => handleComponentClick('surface')}
            onMouseEnter={() => setHoveredComponent('surface')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />

          {/* Pan body (sides) */}
          <path 
            d="M40 180 L40 175 Q40 100 170 100 Q300 100 300 175 L300 180"
            fill="none"
            stroke={activeComponent === 'body' || hoveredComponent === 'body' 
              ? 'var(--color-green-500)' 
              : 'var(--color-gray-500)'}
            strokeWidth={activeComponent === 'body' || hoveredComponent === 'body' ? 6 : 4}
            className={styles.interactiveArea}
            onClick={() => handleComponentClick('body')}
            onMouseEnter={() => setHoveredComponent('body')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />

          {/* Handle */}
          <rect 
            x="300" y="125" width="90" height="22" rx="4"
            fill={activeComponent === 'handle' || hoveredComponent === 'handle' 
              ? 'var(--color-yellow-200)' 
              : 'var(--color-gray-400)'}
            stroke={activeComponent === 'handle' || hoveredComponent === 'handle' 
              ? 'var(--color-yellow-500)' 
              : 'var(--color-gray-500)'}
            strokeWidth="2"
            className={styles.interactiveArea}
            onClick={() => handleComponentClick('handle')}
            onMouseEnter={() => setHoveredComponent('handle')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />

          {/* Handle grip pattern */}
          <g opacity="0.3">
            <line x1="315" y1="130" x2="315" y2="142" stroke="var(--color-gray-600)" strokeWidth="2" />
            <line x1="325" y1="130" x2="325" y2="142" stroke="var(--color-gray-600)" strokeWidth="2" />
            <line x1="335" y1="130" x2="335" y2="142" stroke="var(--color-gray-600)" strokeWidth="2" />
            <line x1="345" y1="130" x2="345" y2="142" stroke="var(--color-gray-600)" strokeWidth="2" />
          </g>

          {/* Rivets */}
          <circle 
            cx="292" cy="136" r="8"
            fill={activeComponent === 'rivets' || hoveredComponent === 'rivets' 
              ? 'var(--color-green-400)' 
              : 'var(--color-gray-500)'}
            stroke={activeComponent === 'rivets' || hoveredComponent === 'rivets' 
              ? 'var(--color-green-600)' 
              : 'var(--color-gray-600)'}
            strokeWidth="2"
            className={styles.interactiveArea}
            onClick={() => handleComponentClick('rivets')}
            onMouseEnter={() => setHoveredComponent('rivets')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
          
          {/* Lid (dotted outline above) */}
          <ellipse 
            cx="170" cy="80" rx="110" ry="20"
            fill="none"
            stroke={activeComponent === 'lid' || hoveredComponent === 'lid' 
              ? 'var(--color-yellow-500)' 
              : 'var(--color-gray-300)'}
            strokeWidth="2"
            strokeDasharray="8 4"
            className={styles.interactiveArea}
            onClick={() => handleComponentClick('lid')}
            onMouseEnter={() => setHoveredComponent('lid')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
          
          {/* Lid knob */}
          <circle cx="170" cy="55" r="10" 
            fill="var(--color-gray-300)"
            stroke="var(--color-gray-400)"
            strokeWidth="1"
          />

          {/* Status indicator dots */}
          <g className={styles.statusDots}>
            {/* Cooking surface indicator */}
            <circle cx="170" cy="140" r="8" fill={getStatusColor('verified')}>
              <title>Cooking Surface: Verified</title>
            </circle>
            
            {/* Handle indicator */}
            <circle cx="370" cy="136" r="8" fill={getStatusColor('partial')}>
              <title>Handle: Partially Verified</title>
            </circle>
            
            {/* Lid indicator */}
            <circle cx="170" cy="55" r="6" fill={getStatusColor('partial')}>
              <title>Lid: Partially Verified</title>
            </circle>
          </g>

          {/* Labels with connecting lines */}
          <g className={styles.labels} fontSize="11" fill="var(--color-gray-600)">
            <text x="170" y="160" textAnchor="middle" fontWeight="600">Cooking Surface</text>
            <text x="345" y="165" textAnchor="middle" fontWeight="600">Handle</text>
            <text x="170" y="35" textAnchor="middle" fontWeight="600">Lid</text>
          </g>
        </svg>

        {/* Component Details Panel */}
        {activeData && (
          <div className={styles.detailsPanel}>
            <div 
              className={styles.statusIndicator}
              style={{ backgroundColor: getStatusColor(activeData.status) }}
            />
            <div className={styles.detailsContent}>
              <h4 className={styles.componentName}>
                {activeData.name}
                {activeData.foodContact && (
                  <span className={styles.foodContactBadge}>Food Contact</span>
                )}
              </h4>
              <p className={styles.componentMaterial}>
                <strong>Material:</strong> {activeData.material}
                {activeData.coating && (
                  <><br /><strong>Coating:</strong> {activeData.coating}</>
                )}
              </p>
              <p className={styles.componentDescription}>{activeData.description}</p>
              <span 
                className={styles.statusBadge}
                style={{ 
                  backgroundColor: `color-mix(in srgb, ${getStatusColor(activeData.status)} 15%, white)`,
                  color: activeData.status === 'unknown' ? 'var(--color-gray-600)' : getStatusColor(activeData.status),
                  borderColor: getStatusColor(activeData.status)
                }}
              >
                {getStatusLabel(activeData.status)}
              </span>
            </div>
          </div>
        )}

        {!activeData && interactive && (
          <div className={styles.instruction}>
            Click or hover over pan components to see verification details
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: 'var(--color-green-500)' }} />
            <span>Verified PFAS-Free</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: 'var(--color-yellow-500)' }} />
            <span>Partially Verified</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: 'var(--color-gray-400)' }} />
            <span>Unknown / Not Verified</span>
          </div>
        </div>
      )}

      {/* Component List */}
      <div className={styles.componentList}>
        {components.map((component) => (
          <button
            key={component.id}
            className={`${styles.componentButton} ${activeComponent === component.id ? styles.active : ''}`}
            onClick={() => handleComponentClick(component.id)}
            style={{ '--status-color': getStatusColor(component.status) } as React.CSSProperties}
          >
            <span 
              className={styles.componentDot} 
              style={{ backgroundColor: getStatusColor(component.status) }}
            />
            <span className={styles.componentLabel}>
              {component.name}
              {component.foodContact && <span className={styles.foodBadge}>🍳</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ComponentDiagram;
