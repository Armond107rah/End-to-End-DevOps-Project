import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);

  // ==========================================
  // READ - Get all items
  // ==========================================
  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ==========================================
  // CREATE - Add a new item
  // ==========================================
  const handleAddItem = async () => {
    try {
      const response = await axios.post('/api/items', {
        name,
        description
      });

      setItems([...items, response.data]);

      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // ==========================================
  // UPDATE - Update an existing item
  // ==========================================
  const handleUpdateItem = async () => {
    try {
      const response = await axios.put(`/api/items/${editId}`, {
        name,
        description
      });

      setItems(
        items.map((item) =>
          item.id === editId ? response.data : item
        )
      );

      setName('');
      setDescription('');
      setEditId(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // ==========================================
  // DELETE - Delete an item
  // ==========================================
  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`);

      setItems(
        items.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // ==========================================
  // EDIT - Load selected item into form
  // ==========================================
  const handleEditItem = (item) => {
    setName(item.name);
    setDescription(item.description);
    setEditId(item.id);
  };

  // ==========================================
  // Handle form submission
  // ==========================================
  const handleSubmit = (event) => {
    event.preventDefault();

    if (editId !== null) {
      handleUpdateItem();
    } else {
      handleAddItem();
    }
  };

  return (
    <div className="App">
      <h1>PERN Stack Application</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Item name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Item description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>

        <button type="submit">
          {editId !== null ? 'Update Item' : 'Add Item'}
        </button>
      </form>

      <hr />

      <h2>Items</h2>

      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong>
              {' - '}
              {item.description}

              {' '}

              <button
                type="button"
                onClick={() => handleEditItem(item)}
              >
                Edit
              </button>

              {' '}

              <button
                type="button"
                onClick={() => handleDeleteItem(item.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
