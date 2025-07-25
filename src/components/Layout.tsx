import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChefHat, Receipt, Package, Calendar } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const tabs = [
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'ingredients', label: 'Ingredients', icon: Package },
    { id: 'sales', label: 'New Sale', icon: Receipt },
    { id: 'history', label: 'Sales History', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-card shadow-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-3 rounded-xl">
                <ChefHat className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Panshule</h1>
                <p className="text-muted-foreground">Home Bakery Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => onTabChange(tab.id)}
                  className="flex items-center space-x-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;