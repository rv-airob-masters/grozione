import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const GroceryList = ({ items, onDelete }) => {
  const { toast } = useToast();

  const handleDelete = async (id, itemName) => {
    try {
      await onDelete(id);
      toast({
        title: "Item Removed",
        description: `${itemName} has been removed from your list`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No items yet</h3>
          <p className="text-muted-foreground">Start adding items to your grocery list!</p>
        </CardContent>
      </Card>
    );
  }

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Grocery Items ({items.length})
          </CardTitle>
        </CardHeader>
      </Card>

      {Object.entries(groupedItems)
        .sort(([a], [b]) => new Date(b) - new Date(a))
        .map(([date, dateItems]) => (
          <Card key={date}>
            <CardHeader className="pb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {formatDate(date)}
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {dateItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.itemName}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {item.store}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span className="font-medium text-foreground">
                        £{item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.itemName)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default GroceryList;