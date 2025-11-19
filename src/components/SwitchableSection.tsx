import React, { useState } from 'react';
import Airdrop from '@/partials/Airdrop';
import Drop from '@/partials/Drop';

type Tab = 'airdrop' | 'drop';

const SwitchableSection: React.FC<{ className?: string }> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<Tab>('airdrop');

  const getButtonClass = (tab: Tab) => {
    return `w-full py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? 'bg-blue-500 text-white'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    }`;
  };

  return (
    <div className={`p-4 rounded-lg bg-gray-800/40 border border-indigo-900/40 backdrop-blur-sm ${className}`}>
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="w-1/2">
            <button onClick={() => setActiveTab('airdrop')} className={getButtonClass('airdrop')}>
            Airdrop
            </button>
        </div>
        <div className="w-1/2">
            <button onClick={() => setActiveTab('drop')} className={getButtonClass('drop')}>
            Drop
            </button>
        </div>
      </div>
      <div>
        {activeTab === 'airdrop' && <Airdrop />}
        {activeTab === 'drop' && <Drop />}
      </div>
    </div>
  );
};

export default SwitchableSection;
