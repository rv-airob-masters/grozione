import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Store, Package } from 'lucide-react';

const StoreSummary = ({ summary }) => {
  if (summary.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No store data</h3>
          <p className="text-muted-foreground">Add some grocery items to see store summaries!</p>
        </CardContent>
      </Card>
    );
  }

  const totalSpent = summary.reduce((sum, store) => sum + store.totalSpent, 0);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Store Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              £{totalSpent.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {summary
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .map((store) => (
            <Card key={store.store} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{store.store}</CardTitle>
                  <Badge variant="outline" className="font-medium">
                    £{store.totalSpent.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{store.itemCount} items</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Avg: £{(store.totalSpent / store.itemCount).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recent Items:</h4>
                  <div className="flex flex-wrap gap-1">
                    {store.items.slice(0, 4).map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {item.itemName}
                      </Badge>
                    ))}
                    {store.items.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{store.items.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default StoreSummary;