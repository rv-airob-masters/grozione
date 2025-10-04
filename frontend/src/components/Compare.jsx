import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingDown, TrendingUp, Scale } from 'lucide-react';

const Compare = ({ items }) => {
  // Group items by name (case insensitive)
  const groupedItems = items.reduce((acc, item) => {
    const itemName = item.itemName.toLowerCase().trim();
    if (!acc[itemName]) {
      acc[itemName] = [];
    }
    acc[itemName].push(item);
    return acc;
  }, {});

  // Filter groups that have more than one item from different stores
  const comparableItems = Object.entries(groupedItems)
    .filter(([_, itemGroup]) => {
      // Check if we have items from different stores
      const uniqueStores = new Set(itemGroup.map(item => item.store));
      return uniqueStores.size > 1;
    })
    .map(([itemName, itemGroup]) => {
      // Sort by price to find cheapest and most expensive
      const sortedByPrice = [...itemGroup].sort((a, b) => a.price - b.price);
      const cheapest = sortedByPrice[0];
      const mostExpensive = sortedByPrice[sortedByPrice.length - 1];
      const savings = mostExpensive.price - cheapest.price;
      const savingsPercentage = savings > 0 ? ((savings / mostExpensive.price) * 100).toFixed(1) : '0.0';

      return {
        itemName: itemGroup[0].itemName, // Use original case
        cheapest,
        mostExpensive,
        savings,
        savingsPercentage,
        allStores: itemGroup,
        storeCount: itemGroup.length
      };
    })
    .filter(comparison => comparison.savings > 0) // Only show items with actual price differences
    .sort((a, b) => b.savings - a.savings); // Sort by highest savings first

  if (comparableItems.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No items to compare</h3>
          <p className="text-muted-foreground">
            Add the same item from different stores to see price comparisons!
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPotentialSavings = comparableItems.reduce((sum, item) => sum + item.savings, 0);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Price Comparison ({comparableItems.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              £{totalPotentialSavings.toFixed(2)}
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Total Potential Savings
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {comparableItems.map((comparison, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{comparison.itemName}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {comparison.storeCount} stores
                  </Badge>
                  <Badge variant="secondary" className="font-medium text-green-600 dark:text-green-400">
                    Save £{comparison.savings.toFixed(2)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Best Deal */}
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-300">Best Deal</span>
                      <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900">
                        {comparison.cheapest.store}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Qty: {comparison.cheapest.quantity}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        £{comparison.cheapest.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Most Expensive */}
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-700 dark:text-red-300">Most Expensive</span>
                      <Badge variant="outline" className="text-xs bg-red-100 dark:bg-red-900">
                        {comparison.mostExpensive.store}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Qty: {comparison.mostExpensive.quantity}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        £{comparison.mostExpensive.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Savings Summary */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">You save {comparison.savingsPercentage}%</span>
                    <span className="text-muted-foreground"> by choosing {comparison.cheapest.store}</span>
                  </div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    £{comparison.savings.toFixed(2)}
                  </div>
                </div>

                {/* All Stores List */}
                {comparison.allStores.length > 2 && (
                  <div className="pt-2 border-t">
                    <h4 className="font-medium text-sm mb-2">All Stores:</h4>
                    <div className="flex flex-wrap gap-2">
                      {comparison.allStores
                        .sort((a, b) => a.price - b.price)
                        .map((item, idx) => (
                          <Badge 
                            key={idx} 
                            variant={item.price === comparison.cheapest.price ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {item.store}: £{item.price.toFixed(2)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Compare;