import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { RecipeConfig } from '@/types';

export interface CustomRecipe extends RecipeConfig {
  customId: string;
  isCustom: true;
}

export function useCustomRecipes() {
  const [recipes, setRecipes] = useLocalStorage<CustomRecipe[]>('desem_custom_recipes', []);

  const addRecipe = useCallback((recipe: Omit<CustomRecipe, 'customId' | 'isCustom'>) => {
    const customRecipe: CustomRecipe = {
      ...recipe,
      customId: `custom-${Date.now()}`,
      isCustom: true,
    };
    setRecipes(prev => [...prev, customRecipe]);
    return customRecipe;
  }, [setRecipes]);

  const updateRecipe = useCallback((customId: string, recipe: Omit<CustomRecipe, 'customId' | 'isCustom'>) => {
    setRecipes(prev =>
      prev.map(r => r.customId === customId ? { ...recipe, customId, isCustom: true as const } : r)
    );
  }, [setRecipes]);

  const deleteRecipe = useCallback((customId: string) => {
    setRecipes(prev => prev.filter(r => r.customId !== customId));
  }, [setRecipes]);

  return { customRecipes: recipes, addRecipe, updateRecipe, deleteRecipe };
}
