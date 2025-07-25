import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, User, DollarSign, Package } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  cost: number;
}

interface SaleItem {
  recipeId: string;
  quantity: number;
}

interface Sale {
  id: string;
  customerName: string;
  date: string;
  items: SaleItem[];
  total: number;
}

const HistoryTab = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const savedSales = localStorage.getItem('panshule-sales');
    const savedRecipes = localStorage.getItem('panshule-recipes');
    
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
  }, []);

  const getRecipeName = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe ? recipe.name : 'Unknown Recipe';
  };

  const filteredSales = sales.filter(sale => {
    const matchesCustomer = !filterCustomer || 
      sale.customerName.toLowerCase().includes(filterCustomer.toLowerCase());
    
    const matchesDate = !filterDate || 
      sale.date.startsWith(filterDate);
    
    return matchesCustomer && matchesDate;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = filteredSales.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Calendar className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Sales History</h2>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="filter-customer">Customer Name</Label>
              <Input
                id="filter-customer"
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                placeholder="Search by customer name"
              />
            </div>
            <div>
              <Label htmlFor="filter-date">Date</Label>
              <Input
                id="filter-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="flex items-center p-6">
            <DollarSign className="w-8 h-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center p-6">
            <Package className="w-8 h-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-primary">{totalSales}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {filteredSales.map((sale) => (
          <Card key={sale.id} className="shadow-card hover:shadow-warm transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{sale.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(sale.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Items:</p>
                    {sale.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.quantity}x {getRecipeName(item.recipeId)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ${sale.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSales.length === 0 && sales.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sales recorded yet. Start by recording your first sale!</p>
          </CardContent>
        </Card>
      )}

      {filteredSales.length === 0 && sales.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No sales match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoryTab;