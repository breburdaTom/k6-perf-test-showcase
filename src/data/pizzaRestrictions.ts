export interface PizzaRestrictions {
  maxCaloriesPerSlice: number;
  mustBeVegetarian: boolean;
  excludedIngredients: string[];
  excludedTools: string[];
  maxNumberOfToppings: number;
  minNumberOfToppings: number;
}

export const pizzaRestrictions: PizzaRestrictions[] = [
  {
    maxCaloriesPerSlice: 700,
    mustBeVegetarian: true,
    excludedIngredients: ['anchovies'],
    excludedTools: [],
    maxNumberOfToppings: 4,
    minNumberOfToppings: 2,
  },
  {
    maxCaloriesPerSlice: 900,
    mustBeVegetarian: false,
    excludedIngredients: ['pineapple'],
    excludedTools: ['knife'],
    maxNumberOfToppings: 5,
    minNumberOfToppings: 2,
  },
  {
    maxCaloriesPerSlice: 550,
    mustBeVegetarian: true,
    excludedIngredients: ['bacon', 'pepperoni'],
    excludedTools: ['Scissors'],
    maxNumberOfToppings: 3,
    minNumberOfToppings: 1,
  },
];

export function pickRestriction(iteration: number): PizzaRestrictions {
  const normalizedIndex =
    ((iteration % pizzaRestrictions.length) + pizzaRestrictions.length) %
    pizzaRestrictions.length;

  return pizzaRestrictions[normalizedIndex];
}
