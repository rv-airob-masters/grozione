import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, ShoppingCart, Edit2, Check, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const GroceryList = ({ items, onDelete, onUpdate }) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const storeOptions = [
    'Tesco',
    'Asda',
    'Aldi',
    'Lidl',
    'Best foods',
    'Quality',
    'Freshco',
    'Others'
  ];

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      itemName: item.itemName,
      store: item.store,
      quantity: item.quantity,
      price: item.price.toString()
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id, originalName) => {
    try {
      await onUpdate(id, {
        itemName: editForm.itemName,
        store: editForm.store,
        quantity: editForm.quantity,
        price: parseFloat(editForm.price)
      });

      setEditingId(null);
      setEditForm({});

      toast({
        title: "Item Updated",
        description: `${editForm.itemName} has been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

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
                <div key={item.id} className="p-3 border rounded-lg">
                  {editingId === item.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Item Name</label>
                          <Input
                            value={editForm.itemName}
                            onChange={(e) => setEditForm({...editForm, itemName: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Store</label>
                          <Select
                            value={editForm.store}
                            onValueChange={(value) => setEditForm({...editForm, store: value})}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {storeOptions.map(store => (
                                <SelectItem key={store} value={store}>{store}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Quantity</label>
                          <Input
                            value={editForm.quantity}
                            onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Price (£)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(item.id, item.itemName)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
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

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.itemName)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default GroceryList;