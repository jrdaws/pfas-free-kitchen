'use client';

import { useState, useCallback, type ReactNode } from 'react';
import styles from './ProductTabs.module.css';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface ProductTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: ReactNode;
}

interface TabPanelProps {
  id: string;
  children: ReactNode;
}

export function ProductTabs({ tabs, defaultTab, children }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    if (e.key === 'ArrowRight') {
      newIndex = index === tabs.length - 1 ? 0 : index + 1;
    } else if (e.key === 'ArrowLeft') {
      newIndex = index === 0 ? tabs.length - 1 : index - 1;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    setActiveTab(tabs[newIndex].id);
    
    // Focus the new tab
    const tabElement = document.getElementById(`tab-${tabs[newIndex].id}`);
    tabElement?.focus();
  }, [tabs]);

  return (
    <div className={styles.container}>
      {/* Tab List */}
      <div className={styles.tabListWrapper}>
        <div 
          className={styles.tabList} 
          role="tablist" 
          aria-label="Product information tabs"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={styles.count}>({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div className={styles.panels}>
        {/* Render all children but only show the active one */}
        {Array.isArray(children) ? (
          children.map((child) => {
            if (!child || typeof child !== 'object' || !('props' in child)) return null;
            const panelId = (child.props as TabPanelProps).id;
            return (
              <div
                key={panelId}
                id={`panel-${panelId}`}
                role="tabpanel"
                aria-labelledby={`tab-${panelId}`}
                hidden={activeTab !== panelId}
                className={styles.panel}
                tabIndex={0}
              >
                {child}
              </div>
            );
          })
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function TabPanel({ id, children }: TabPanelProps) {
  return <>{children}</>;
}
