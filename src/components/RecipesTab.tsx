import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Save, X, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  cost: number;
  salePrice?: number;
}

const RecipesTab = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Record<string, number>>({});
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedRecipes = localStorage.getItem('panshule-recipes');
    const savedIngredients = localStorage.getItem('panshule-ingredients');
    
if (savedRecipes) {
  const parsed: Recipe[] = JSON.parse(savedRecipes);
  setRecipes(parsed.map(r => ({ ...r, salePrice: r.salePrice ?? 0 })));
}
    if (savedIngredients) {
      setIngredients(JSON.parse(savedIngredients));
    }
  }, []);

  // Listen for ingredient price changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedIngredients = localStorage.getItem('panshule-ingredients');
      if (savedIngredients) {
        setIngredients(JSON.parse(savedIngredients));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Recalculate recipe costs when ingredients change
  useEffect(() => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => ({
        ...recipe,
        cost: calculateRecipeCost(recipe.ingredients)
      }))
    );
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('panshule-recipes', JSON.stringify(recipes));
  }, [recipes]);

  const calculateRecipeCost = (recipeIngredients: Ingredient[]) => {
    return recipeIngredients.reduce((total, ingredient) => {
      const price = ingredients[ingredient.name] || 0;
      return total + (price * ingredient.quantity);
    }, 0);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    const cost = calculateRecipeCost(recipe.ingredients);
    const updatedRecipe = { ...recipe, cost };

    if (isCreating) {
      setRecipes([...recipes, { ...updatedRecipe, id: Date.now().toString() }]);
      toast({ title: "Recipe created successfully!" });
    } else {
      setRecipes(recipes.map(r => r.id === recipe.id ? updatedRecipe : r));
      toast({ title: "Recipe updated successfully!" });
    }
    
    setEditingRecipe(null);
    setIsCreating(false);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter(r => r.id !== id));
    toast({ title: "Recipe deleted successfully!" });
  };

  const RecipeForm = ({ recipe, onSave, onCancel }: {
    recipe: Recipe;
    onSave: (recipe: Recipe) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(recipe);

    const addIngredient = () => {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, { name: '', quantity: 0, unit: '' }]
      });
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
      const newIngredients = [...formData.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      setFormData({ ...formData, ingredients: newIngredients });
    };

    const removeIngredient = (index: number) => {
      setFormData({
        ...formData,
        ingredients: formData.ingredients.filter((_, i) => i !== index)
      });
    };

    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{isCreating ? 'New Recipe' : 'Edit Recipe'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipe-name">Recipe Name</Label>
            <Input
              id="recipe-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter recipe name"
            />
          </div>
          
          <div>
            <Label htmlFor="recipe-sale-price">Final Sale Price</Label>
            <Input
              id="recipe-sale-price"
              type="number"
              min="0"
              step="0.01"
              value={formData.salePrice ?? 0}
              onChange={(e) =>
                setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })
              }
              placeholder="Enter final sale price"
            />
          </div>

          <div>
            <Label>Ingredients</Label>
            <div className="space-y-2 mt-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={ingredient.quantity || ''}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addIngredient}>
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)}>
              <Save className="w-4 h-4 mr-2" />
              Save Recipe
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

  if (editingRecipe || isCreating) {
    return (
      <RecipeForm
        recipe={editingRecipe || { id: '', name: '', ingredients: [], cost: 0, salePrice: 0 }}
        onSave={handleSaveRecipe}
        onCancel={() => {
          setEditingRecipe(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Recipes</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Recipe
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="shadow-card hover:shadow-warm transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{recipe.name}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRecipe(recipe)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRecipe(recipe.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingredients:</p>
                  <ul className="text-sm space-y-1">
                    {recipe.ingredients.map((ingredient, index) => {
                      const price = ingredients[ingredient.name] || 0;
                      const cost = price * ingredient.quantity;
                      const hasPrice = ingredients[ingredient.name] !== undefined;
                      
                      return (
                        <li key={index} className="flex justify-between items-center">
                          <span className={hasPrice ? '' : 'text-orange-500'}>
                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
                          </span>
                          <span className={`text-xs ${hasPrice ? 'text-muted-foreground' : 'text-orange-500'}`}>
                            {hasPrice ? `$${cost.toFixed(2)}` : 'No price'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-sm font-medium">
                    Total Cost: <span className="text-primary font-bold">${recipe.cost.toFixed(2)}</span>
                  </p>
                  {typeof recipe.salePrice === 'number' && recipe.salePrice > 0 && (
                    <p className="text-sm">
                      Sale Price: <span className="font-medium">${recipe.salePrice.toFixed(2)}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recipes.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recipes yet. Create your first recipe to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecipesTab;