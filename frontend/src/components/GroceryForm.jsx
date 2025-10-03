import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const GroceryForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    store: '',
    quantityValue: '',
    quantityUnit: 'kg',
    price: ''
  });
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.store || !formData.quantityValue || !formData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parseFloat(formData.quantityValue)) || parseFloat(formData.quantityValue) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAdd({
        itemName: formData.itemName,
        store: formData.store,
        quantity: `${formData.quantityValue} ${formData.quantityUnit}`,
        price: parseFloat(formData.price)
      });
      
      setFormData({
        itemName: '',
        store: '',
        quantityValue: '',
        quantityUnit: 'kg',
        price: ''
      });
      
      toast({
        title: "Item Added!",
        description: `${formData.itemName} has been added to your grocery list`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStoreChange = (value) => {
    setFormData({
      ...formData,
      store: value
    });
  };

  const handleQuantityUnitChange = (value) => {
    setFormData({
      ...formData,
      quantityUnit: value
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Grocery Item
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              name="itemName"
              type="text"
              placeholder="e.g., Organic Bananas"
              value={formData.itemName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="store">Store</Label>
            <Select onValueChange={handleStoreChange} value={formData.store} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {storeOptions.map((store) => (
                  <SelectItem key={store} value={store}>
                    {store}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex gap-2">
              <Input
                id="quantityValue"
                name="quantityValue"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.quantityValue}
                onChange={handleChange}
                disabled={isLoading}
                className="flex-1"
              />
              <Select onValueChange={handleQuantityUnitChange} value={formData.quantityUnit} disabled={isLoading}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="l">l</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="nos">nos</SelectItem>
                  <SelectItem value="packets">packets</SelectItem>
                  <SelectItem value="boxes">boxes</SelectItem>
                  <SelectItem value="cans">cans</SelectItem>
                  <SelectItem value="bottles">bottles</SelectItem>
                  <SelectItem value="bags">bags</SelectItem>
                  <SelectItem value="packs">packs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price (£)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Item'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GroceryForm;