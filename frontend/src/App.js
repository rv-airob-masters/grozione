import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/toaster';
import GroceryForm from './components/GroceryForm';
import GroceryList from './components/GroceryList';
import StoreSummary from './components/StoreSummary';
import Compare from './components/Compare';
import ReceiptScanner from './components/ReceiptScanner';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { createAPIWithFallback } from './api';
import { ShoppingCart, Store, Plus, Scale, ArrowLeft, Home, Scan, LogOut, User, Users, BarChart3 } from 'lucide-react';
import "./App.css";

function GroceryApp() {
  const [groceryItems, setGroceryItems] = useState([]);
  const [storeSummary, setStoreSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();

  // Initialize API with fallback
  const apiService = createAPIWithFallback();

  // Navigate to view
  const navigateToView = (view) => {
    setCurrentView(view);
  };

  // Load initial data and reset view when user changes
  useEffect(() => {
    if (user) {
      setCurrentView('home'); // Reset to home page on login
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [items, summary] = await Promise.all([
        apiService.getGroceryItems(),
        apiService.getStoreSummary()
      ]);
      setGroceryItems(items);
      setStoreSummary(summary);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      await apiService.addGroceryItem(itemData);
      await loadData(); // Refresh data
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateItem = async (id, item) => {
    try {
      await apiService.updateGroceryItem(id, item);
      await loadData(); // Refresh data
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await apiService.deleteGroceryItem(id);
      await loadData(); // Refresh data
    } catch (error) {
      throw error;
    }
  };

  // Base tiles for all users
  const baseTiles = [
    {
      id: 'add',
      title: 'Add New Item',
      description: 'Add groceries with store details and prices',
      icon: Plus,
      color: 'bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-900/20 dark:to-pink-900/20',
      hoverColor: 'hover:from-rose-200 hover:to-pink-300 dark:hover:from-rose-900/30 dark:hover:to-pink-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      count: null
    },
    {
      id: 'scan',
      title: 'Scan Receipt',
      description: 'Upload or take photo of receipt to extract items',
      icon: Scan,
      color: 'bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/20 dark:to-orange-900/20',
      hoverColor: 'hover:from-amber-200 hover:to-orange-300 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      count: null
    },
    {
      id: 'list',
      title: 'My Items',
      description: 'View and manage your grocery list',
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/20 dark:to-indigo-900/20',
      hoverColor: 'hover:from-blue-200 hover:to-indigo-300 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      count: groceryItems.length
    },
    {
      id: 'summary',
      title: 'Store Summary',
      description: 'View spending breakdown by store',
      icon: Store,
      color: 'bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/20 dark:to-teal-900/20',
      hoverColor: 'hover:from-emerald-200 hover:to-teal-300 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      count: storeSummary.length
    },
    {
      id: 'compare',
      title: 'Compare Prices',
      description: 'Find the best deals across stores',
      icon: Scale,
      color: 'bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/20 dark:to-violet-900/20',
      hoverColor: 'hover:from-purple-200 hover:to-violet-300 dark:hover:from-purple-900/30 dark:hover:to-violet-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      count: null
    }
  ];

  // Admin-only tiles
  const adminTiles = [
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard',
      description: 'View user statistics and activity timeline',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-cyan-100 to-sky-200 dark:from-cyan-900/20 dark:to-sky-900/20',
      hoverColor: 'hover:from-cyan-200 hover:to-sky-300 dark:hover:from-cyan-900/30 dark:hover:to-sky-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      count: null
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Add, edit, and manage user accounts',
      icon: Users,
      color: 'bg-gradient-to-br from-fuchsia-100 to-pink-200 dark:from-fuchsia-900/20 dark:to-pink-900/20',
      hoverColor: 'hover:from-fuchsia-200 hover:to-pink-300 dark:hover:from-fuchsia-900/30 dark:hover:to-pink-900/30',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      count: null
    }
  ];

  // Combine tiles based on user role
  const tiles = user?.role === 'admin' ? [...adminTiles, ...baseTiles] : baseTiles;

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Login onLogin={(userData, token) => {
      // The AuthContext will handle the login state automatically
    }} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your grocery data...</p>
        </div>
      </div>
    );
  }

  const handleReceiptItemsAdded = async (newItems) => {
    await loadData(); // Refresh data after items are added from receipt
  };

  const renderContent = () => {
    switch (currentView) {
      case 'add':
        return <GroceryForm onAdd={handleAddItem} />;
      case 'scan':
        return <ReceiptScanner onItemsAdded={handleReceiptItemsAdded} />;
      case 'list':
        return <GroceryList items={groceryItems} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} />;
      case 'summary':
        return <StoreSummary summary={storeSummary} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} />;
      case 'compare':
        return <Compare items={groceryItems} />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'user-management':
        return <UserManagement />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tiles.map((tile) => {
              const IconComponent = tile.icon;
              return (
                <Card
                  key={tile.id}
                  className={`${tile.color} ${tile.hoverColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
                  onClick={() => navigateToView(tile.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-full bg-white/50 dark:bg-black/20`}>
                        <IconComponent className={`h-8 w-8 ${tile.iconColor}`} />
                      </div>
                      {tile.count !== null && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                            {tile.count}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {tile.id === 'list' ? 'items' : 'stores'}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-xl mb-2 text-slate-800 dark:text-slate-200">
                      {tile.title}
                    </CardTitle>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {tile.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-b border-white/20 dark:border-slate-700/50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1601598851547-4302969d0614?w=100&h=100&fit=crop&crop=center"
                  alt="GroziOne Logo"
                  className="h-7 w-7 object-contain filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  GroziOne
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your smart grocery companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentView !== 'home' && (
                <Button
                  variant="ghost"
                  onClick={() => navigateToView('home')}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <User className="h-4 w-4" />
                <span>{user?.username}</span>
                {user?.role === 'admin' && (
                  <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full text-xs">
                    Admin
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                onClick={logout}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' ? (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              {user?.role === 'admin' ? 'Admin Dashboard' : 'Welcome to GroziOne'}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {user?.role === 'admin'
                ? 'Manage users, monitor activity, and oversee the GroziOne platform.'
                : 'Your intelligent grocery companion for smart shopping, spending tracking, and finding the best deals.'}
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-4">
              <Home className="h-4 w-4" />
              <button 
                onClick={() => navigateToView('home')}
                className="text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer underline-offset-4 hover:underline"
              >
                Home
              </button>
              <span>/</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {tiles.find(t => t.id === currentView)?.title}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GroceryApp />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;