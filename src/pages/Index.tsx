import { useState } from 'react';
import Layout from '@/components/Layout';
import RecipesTab from '@/components/RecipesTab';
import IngredientsTab from '@/components/IngredientsTab';
import SalesTab from '@/components/SalesTab';
import HistoryTab from '@/components/HistoryTab';

const Index = () => {
  const [activeTab, setActiveTab] = useState('recipes');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'recipes':
        return <RecipesTab />;
      case 'ingredients':
        return <IngredientsTab />;
      case 'sales':
        return <SalesTab />;
      case 'history':
        return <HistoryTab />;
      default:
        return <RecipesTab />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  );
};

export default Index;
