'use client';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              isActive
                ? 'text-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-text-muted">{tab.count}</span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
