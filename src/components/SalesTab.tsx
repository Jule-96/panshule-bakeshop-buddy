import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  name: string;
  cost: number;
}

interface SaleItem {
  recipeId: string;
  quantity: number;
  salePrice: number;
}

interface Sale {
  id: string;
  customerName: string;
  date: string;
  items: SaleItem[];
  total: number;
}

const SalesTab = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([{ recipeId: '', quantity: 1, salePrice: 0 }]);
  const { toast } = useToast();

  useEffect(() => {
    const savedRecipes = localStorage.getItem('panshule-recipes');
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
  }, []);

  const addSaleItem = () => {
    setSaleItems([...saleItems, { recipeId: '', quantity: 1, salePrice: 0 }]);
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSaleItems(newItems);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => {
      const recipe = recipes.find(r => r.id === item.recipeId);
      const unit = item.salePrice > 0 ? item.salePrice : (recipe ? recipe.cost : 0);
      return total + unit * item.quantity;
    }, 0);
  };

  const handleSaveSale = () => {
    if (!customerName.trim()) {
      toast({ title: "Please enter customer name", variant: "destructive" });
      return;
    }

    const validItems = saleItems.filter(item => item.recipeId && item.quantity > 0 && item.salePrice > 0);
    if (validItems.length === 0) {
      toast({ title: "Please add at least one item", variant: "destructive" });
      return;
    }

    const sale: Sale = {
      id: Date.now().toString(),
      customerName: customerName.trim(),
      date: new Date().toISOString(),
      items: validItems,
      total: calculateTotal(),
    };

    const existingSales = JSON.parse(localStorage.getItem('panshule-sales') || '[]');
    const updatedSales = [sale, ...existingSales];
    localStorage.setItem('panshule-sales', JSON.stringify(updatedSales));

    // Also append line items to Orders for tracking
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrders = validItems.map((item, idx) => {
      const recipe = recipes.find(r => r.id === item.recipeId);
      return {
        id: `${sale.id}-${idx}`,
        timestamp: sale.date,
        cliente: sale.customerName,
        producto: recipe ? recipe.name : item.recipeId,
        cantidad: item.quantity,
        precio: item.salePrice,
        comentarios: '',
        direccion: '',
        estado: "Pedido",
        cobrado: false,
      };
    });
    localStorage.setItem('orders', JSON.stringify([...newOrders, ...existingOrders]));

    toast({ title: "Sale recorded successfully!" });
    
    // Reset form
    setCustomerName('');
    setSaleItems([{ recipeId: '', quantity: 1, salePrice: 0 }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Receipt className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">New Sale</h2>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Sale Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name or nickname"
            />
          </div>

          <div>
            <Label>Items</Label>
            <div className="space-y-3 mt-2">
              {saleItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Select
                      value={item.recipeId}
                      onValueChange={(value) => updateSaleItem(index, 'recipeId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name} - ${recipe.cost.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="Qty"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.salePrice}
                      onChange={(e) =>
                        updateSaleItem(index, 'salePrice', parseFloat(e.target.value) || 0)
                      }
                      placeholder="Sale price"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSaleItem(index)}
                    disabled={saleItems.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSaleItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {saleItems.some(item => item.recipeId) && (
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button onClick={handleSaveSale} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Record Sale
          </Button>
        </CardContent>
      </Card>

      {recipes.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No recipes available. Please create some recipes first before recording sales.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesTab;