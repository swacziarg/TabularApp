type TabsProps = {
    tabs: { id: string; label: string }[];
    activeTab: string;
    onChange: (id: string) => void;
  };
  
  export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
    return (
      <div className="tabsRow">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={activeTab === t.id ? 'tabBtn tabBtnActive' : 'tabBtn'}
            onClick={() => onChange(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  }
  