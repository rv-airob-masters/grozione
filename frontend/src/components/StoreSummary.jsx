import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Store, Package, ChevronRight, ChevronDown, Edit2, Trash2, Check, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const StoreSummary = ({ summary, onUpdate, onDelete }) => {
  const [expandedStore, setExpandedStore] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { toast } = useToast();

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

  const handleStoreClick = (storeName) => {
    setExpandedStore(expandedStore === storeName ? null : storeName);
    setEditingId(null); // Close any open edit forms
  };

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
          .map((store) => {
            const isExpanded = expandedStore === store.store;
            return (
              <Card key={store.store} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleStoreClick(store.store)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-lg hover:text-primary transition-colors">
                        {store.store}
                      </CardTitle>
                    </div>
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
                      <span className="font-medium">Total Spend: £{store.totalSpent.toFixed(2)}</span>
                    </div>
                  </div>

                  {!isExpanded && (
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
                      <p className="text-xs text-muted-foreground mt-2">
                        Click to view all items
                      </p>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="space-y-3 mt-4 border-t pt-4">
                      <h4 className="font-medium text-sm">All Items ({store.items.length}):</h4>
                      {store.items.map((item) => (
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
                                      {storeOptions.map(storeOpt => (
                                        <SelectItem key={storeOpt} value={storeOpt}>{storeOpt}</SelectItem>
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
                                    {item.date}
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
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default StoreSummary;