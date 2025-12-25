import { memo } from 'react';
import { SkillTab, SkillType } from '../../../types/skill';
import styles from './SkillTabs.module.css';

interface SkillTabsProps {
    tabs: SkillTab[];
    activeTab: SkillType;
    onTabChange: (tabId: SkillType) => void;
}

const SkillTabs = memo(({ tabs, activeTab, onTabChange }: SkillTabsProps) => {
    return (
        <nav className={styles.tabsContainer}>
            <ul className={styles.tabsList} role="tablist">
                {tabs.map((tab) => (
                    <li key={tab.id} role="presentation">
                        <button
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`panel-${tab.id}`}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                            onClick={() => onTabChange(tab.id)}
                        >
                            <span className={styles.tabLabel}>{tab.label}</span>
                            <span className={styles.tabCount}>({tab.count.toString().padStart(2, '0')})</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
});

SkillTabs.displayName = 'SkillTabs';

export default SkillTabs;
