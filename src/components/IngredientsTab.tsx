import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IngredientPrice {
  name: string;
  price: number; // calculated price per unit
  unit: string;
  productPrice: number; // full product price (e.g., $900 for 1kg)
  productQuantity: number; // full product quantity (e.g., 1000 for 1kg)
  productUnit: string; // full product unit (e.g., "kg")
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

    // Calculate price per unit automatically
    const calculatePricePerUnit = (productPrice: number, productQuantity: number) => {
      if (productQuantity > 0) {
        return productPrice / productQuantity;
      }
      return 0;
    };

    // Update price per unit when product price or quantity changes
    const updateFormData = (updates: Partial<IngredientPrice>) => {
      const newData = { ...formData, ...updates };
      
      if (updates.productPrice !== undefined || updates.productQuantity !== undefined) {
        newData.price = calculatePricePerUnit(newData.productPrice, newData.productQuantity);
      }
      
      setFormData(newData);
    };

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
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="e.g., Flour, Sugar, Butter"
              disabled={!isCreating}
            />
          </div>

          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
            <h4 className="font-medium text-sm">Product Purchase Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-price">Product Price</Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  value={formData.productPrice || ''}
                  onChange={(e) => updateFormData({ productPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="900.00"
                />
                <p className="text-xs text-muted-foreground mt-1">Total price you paid</p>
              </div>
              <div>
                <Label htmlFor="product-quantity">Product Quantity</Label>
                <Input
                  id="product-quantity"
                  type="number"
                  step="0.01"
                  value={formData.productQuantity || ''}
                  onChange={(e) => updateFormData({ productQuantity: parseFloat(e.target.value) || 0 })}
                  placeholder="1000"
                />
                <p className="text-xs text-muted-foreground mt-1">Amount you bought</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="product-unit">Product Unit</Label>
              <Input
                id="product-unit"
                value={formData.productUnit}
                onChange={(e) => updateFormData({ productUnit: e.target.value })}
                placeholder="kg, liters, pieces"
              />
              <p className="text-xs text-muted-foreground mt-1">Unit of the amount bought</p>
            </div>
          </div>

          <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
            <h4 className="font-medium text-sm">Recipe Unit Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipe-unit">Recipe Unit</Label>
                <Input
                  id="recipe-unit"
                  value={formData.unit}
                  onChange={(e) => updateFormData({ unit: e.target.value })}
                  placeholder="gr, ml, pieces"
                />
                <p className="text-xs text-muted-foreground mt-1">Unit used in recipes</p>
              </div>
              <div>
                <Label>Price per {formData.unit || 'unit'}</Label>
                <Input
                  value={formData.price.toFixed(4)}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Automatically calculated</p>
              </div>
            </div>
            
            {formData.productPrice > 0 && formData.productQuantity > 0 && (
              <div className="text-sm text-muted-foreground">
                Example: ${formData.productPrice} ÷ {formData.productQuantity} {formData.productUnit} = ${formData.price.toFixed(4)} per {formData.unit}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} disabled={!formData.name || formData.productPrice <= 0 || formData.productQuantity <= 0}>
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
        ingredient={editingIngredient || { name: '', price: 0, unit: '', productPrice: 0, productQuantity: 0, productUnit: '' }}
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
                <div className="text-xs text-muted-foreground">
                  <span>Product: ${ingredient.productPrice} for {ingredient.productQuantity} {ingredient.productUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price per {ingredient.unit}:</span>
                  <span className="font-semibold text-primary">${ingredient.price.toFixed(4)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <span>Cost calculation: ${ingredient.price.toFixed(4)} × quantity used in recipe</span>
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