import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IngredientPrice {
  name: string;
  price: number;
  unit: string;
}

const IngredientsTab = () => {
  const [ingredients, setIngredients] = useState<IngredientPrice[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<IngredientPrice | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('panshule-ingredient-prices');
    if (saved) {
      setIngredients(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('panshule-ingredient-prices', JSON.stringify(ingredients));
    
    // Update the ingredients lookup object used by recipes
    const ingredientsLookup = ingredients.reduce((acc, ingredient) => {
      acc[ingredient.name] = ingredient.price;
      return acc;
    }, {} as Record<string, number>);
    localStorage.setItem('panshule-ingredients', JSON.stringify(ingredientsLookup));
  }, [ingredients]);

  const handleSaveIngredient = (ingredient: IngredientPrice) => {
    if (isCreating) {
      setIngredients([...ingredients, ingredient]);
      toast({ title: "Ingredient added successfully!" });
    } else {
      setIngredients(ingredients.map(i => 
        i.name === editingIngredient?.name ? ingredient : i
      ));
      toast({ title: "Ingredient updated successfully!" });
    }
    
    setEditingIngredient(null);
    setIsCreating(false);
  };

  const handleDeleteIngredient = (name: string) => {
    setIngredients(ingredients.filter(i => i.name !== name));
    toast({ title: "Ingredient deleted successfully!" });
  };

  const IngredientForm = ({ ingredient, onSave, onCancel }: {
    ingredient: IngredientPrice;
    onSave: (ingredient: IngredientPrice) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(ingredient);

    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{isCreating ? 'New Ingredient' : 'Edit Ingredient'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ingredient-name">Ingredient Name</Label>
            <Input
              id="ingredient-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Flour, Sugar, Butter"
              disabled={!isCreating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ingredient-price">Price per Unit</Label>
              <Input
                id="ingredient-price"
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="ingredient-unit">Unit</Label>
              <Input
                id="ingredient-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="kg, liter, piece"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)}>
              <Save className="w-4 h-4 mr-2" />
              Save Ingredient
            </Button>
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (editingIngredient || isCreating) {
    return (
      <IngredientForm
        ingredient={editingIngredient || { name: '', price: 0, unit: '' }}
        onSave={handleSaveIngredient}
        onCancel={() => {
          setEditingIngredient(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Ingredient Prices</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ingredients.map((ingredient) => (
          <Card key={ingredient.name} className="shadow-card hover:shadow-warm transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{ingredient.name}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingIngredient(ingredient)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteIngredient(ingredient.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-semibold text-primary">${ingredient.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unit:</span>
                  <span className="text-sm">{ingredient.unit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ingredients.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No ingredients yet. Add your first ingredient to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IngredientsTab;