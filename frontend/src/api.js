// Real API service for GroziOne backend
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Get all grocery items
  getGroceryItems: async () => {
    try {
      const response = await fetch(`${API}/grocery-items`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching grocery items:', error);
      throw error;
    }
  },

  // Add new grocery item
  addGroceryItem: async (item) => {
    try {
      const response = await fetch(`${API}/grocery-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.item;
    } catch (error) {
      console.error('Error adding grocery item:', error);
      throw error;
    }
  },

  // Delete grocery item
  deleteGroceryItem: async (id) => {
    try {
      const response = await fetch(`${API}/grocery-items/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting grocery item:', error);
      throw error;
    }
  },

  // Get spending summary by store
  getStoreSummary: async () => {
    try {
      const items = await api.getGroceryItems();
      
      // Calculate summary from items
      const summary = items.reduce((acc, item) => {
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
      
      return Object.values(summary);
    } catch (error) {
      console.error('Error getting store summary:', error);
      throw error;
    }
  },

  // Status check endpoints
  createStatusCheck: async (clientName) => {
    try {
      const response = await fetch(`${API}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_name: clientName }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating status check:', error);
      throw error;
    }
  },

  getStatusChecks: async () => {
    try {
      const response = await fetch(`${API}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting status checks:', error);
      throw error;
    }
  }
};

// Fallback to mock API if backend is not available
export const createAPIWithFallback = () => {
  return {
    getGroceryItems: async () => {
      try {
        return await api.getGroceryItems();
      } catch (error) {
        console.warn('Backend not available, using mock data:', error);
        const { mockAPI } = await import('./mock');
        return await mockAPI.getGroceryItems();
      }
    },

    addGroceryItem: async (item) => {
      try {
        return await api.addGroceryItem(item);
      } catch (error) {
        console.warn('Backend not available, using mock API:', error);
        const { mockAPI } = await import('./mock');
        return await mockAPI.addGroceryItem(item);
      }
    },

    deleteGroceryItem: async (id) => {
      try {
        return await api.deleteGroceryItem(id);
      } catch (error) {
        console.warn('Backend not available, using mock API:', error);
        const { mockAPI } = await import('./mock');
        return await mockAPI.deleteGroceryItem(id);
      }
    },

    getStoreSummary: async () => {
      try {
        return await api.getStoreSummary();
      } catch (error) {
        console.warn('Backend not available, using mock data:', error);
        const { mockAPI } = await import('./mock');
        return await mockAPI.getStoreSummary();
      }
    }
  };
};
