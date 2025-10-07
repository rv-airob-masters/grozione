// Mock data and functions for grocery list app
let groceryItems = [
  {
    id: 1,
    itemName: "Milk",
    store: "Tesco",
    quantity: "1 kg",
    price: 1.50,
    date: "2024-01-15"
  },
  {
    id: 2,
    itemName: "Milk",
    store: "Asda",
    quantity: "1 kg",
    price: 1.25,
    date: "2024-01-15"
  },
  {
    id: 3,
    itemName: "Milk",
    store: "Aldi",
    quantity: "1 kg",
    price: 1.10,
    date: "2024-01-15"
  },
  {
    id: 4,
    itemName: "Bread",
    store: "Tesco",
    quantity: "800 g",
    price: 2.75,
    date: "2024-01-14"
  },
  {
    id: 5,
    itemName: "Bread",
    store: "Lidl",
    quantity: "800 g",
    price: 1.99,
    date: "2024-01-14"
  },
  {
    id: 6,
    itemName: "Greek Yogurt",
    store: "Asda",
    quantity: "500 g",
    price: 3.20,
    date: "2024-01-15"
  },
  {
    id: 7,
    itemName: "Greek Yogurt",
    store: "Tesco",
    quantity: "500 g",
    price: 3.50,
    date: "2024-01-14"
  },
  {
    id: 8,
    itemName: "Ground Coffee",
    store: "Aldi",
    quantity: "250 g",
    price: 4.50,
    date: "2024-01-14"
  }
];

let nextId = 9;

export const mockAPI = {
  // Get all grocery items
  getGroceryItems: () => {
    return Promise.resolve([...groceryItems]);
  },

  // Add new grocery item
  addGroceryItem: (item) => {
    const newItem = {
      ...item,
      id: nextId++,
      date: new Date().toISOString().split('T')[0]
    };
    groceryItems.push(newItem);
    return Promise.resolve(newItem);
  },

  // Update grocery item
  updateGroceryItem: (id, updates) => {
    const index = groceryItems.findIndex(item => item.id === id);
    if (index !== -1) {
      groceryItems[index] = { ...groceryItems[index], ...updates };
      return Promise.resolve(groceryItems[index]);
    }
    return Promise.reject(new Error('Item not found'));
  },

  // Delete grocery item
  deleteGroceryItem: (id) => {
    const index = groceryItems.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedItem = groceryItems.splice(index, 1)[0];
      return Promise.resolve(deletedItem);
    }
    return Promise.reject(new Error('Item not found'));
  },

  // Get spending summary by store
  getStoreSummary: () => {
    const summary = groceryItems.reduce((acc, item) => {
      if (!acc[item.store]) {
        acc[item.store] = {
          store: item.store,
          totalSpent: 0,
          itemCount: 0,
          items: []
        };
      }
      acc[item.store].totalSpent += item.price;
      acc[item.store].itemCount += 1;
      acc[item.store].items.push(item);
      return acc;
    }, {});
    
    return Promise.resolve(Object.values(summary));
  }
};