import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Camera, Upload, Check, X, AlertCircle, Loader2, Scan } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReceiptScanner = ({ onItemsAdded }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [confirmedStore, setConfirmedStore] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const fileInputRef = useRef(null);
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

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processReceiptImage(file);
    }
  };

  const processReceiptImage = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API}/scan-receipt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to scan receipt');
      }

      const result = await response.json();
      setScanResult(result);
      
      // If store name is unclear, don't auto-set it
      if (!result.store_unclear && result.store_info?.name && result.store_info.name !== 'Unknown Store') {
        setConfirmedStore(result.store_info.name);
      }

      toast({
        title: "Receipt Scanned Successfully",
        description: `Found ${result.items?.length || 0} items with ${Math.round((result.confidence_score || 0) * 100)}% confidence`,
      });
    } catch (error) {
      console.error('Receipt scanning error:', error);
      toast({
        title: "Scanning Failed",
        description: error.message || "Failed to scan receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmItems = async () => {
    if (!scanResult || !confirmedStore) {
      toast({
        title: "Missing Information",
        description: "Please select a store name",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);

    try {
      const response = await fetch(`${API}/confirm-receipt-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: scanResult.items,
          store_name: confirmedStore,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add items');
      }

      const result = await response.json();
      
      toast({
        title: "Items Added Successfully",
        description: result.message,
      });

      // Reset scanner
      setScanResult(null);
      setConfirmedStore('');
      
      // Notify parent component
      if (onItemsAdded) {
        onItemsAdded(result.added_items);
      }

    } catch (error) {
      console.error('Confirmation error:', error);
      toast({
        title: "Failed to Add Items",
        description: error.message || "Failed to add items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setConfirmedStore('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatCurrency = (amount) => {
    return `£${(amount || 0).toFixed(2)}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Receipt Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!scanResult ? (
            <div className="text-center space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Scan Your Grocery Receipt</p>
                <p className="text-gray-600 mb-4">
                  Upload an image of your receipt to automatically extract items and prices
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="space-x-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="min-w-[120px]"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  
                  {/* Camera button for mobile */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('capture', 'environment');
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={isScanning}
                    className="min-w-[120px]"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>
              
              {isScanning && (
                <div className="text-center">
                  <p className="text-gray-600">Processing your receipt...</p>
                  <p className="text-sm text-gray-500">This may take a few seconds</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Processing Status */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Receipt Processed Successfully
                  </span>
                </div>
                <Badge variant="secondary">
                  {Math.round((scanResult.confidence_score || 0) * 100)}% Confidence
                </Badge>
              </div>

              {/* Store Selection */}
              <div className="space-y-2">
                <Label htmlFor="store">Store Name</Label>
                {scanResult.store_unclear && (
                  <Alert className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <div className="ml-2">
                      <p className="text-sm">Store name was not clear from the receipt. Please select the correct store.</p>
                    </div>
                  </Alert>
                )}
                <Select onValueChange={setConfirmedStore} value={confirmedStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the store" />
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

              {/* Items List */}
              {scanResult.items && scanResult.items.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Found Items ({scanResult.items.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scanResult.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name || 'Unknown Item'}</div>
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity || '1 kg'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.total_price)}</div>
                          {item.unit_price && item.unit_price !== item.total_price && (
                            <div className="text-sm text-gray-600">
                              {formatCurrency(item.unit_price)} each
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {scanResult.totals && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(scanResult.totals.total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmItems}
                  disabled={isConfirming || !confirmedStore}
                  className="flex-1"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Items...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Add to Grocery List
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetScanner}
                  disabled={isConfirming}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>

              {/* Debug Info */}
              {process.env.NODE_ENV === 'development' && (
                <details className="text-xs text-gray-500">
                  <summary>Debug Info</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                    {JSON.stringify(scanResult, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptScanner;