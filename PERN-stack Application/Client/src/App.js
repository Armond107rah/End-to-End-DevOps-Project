import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  
  useEffect(() => {
    // Fetch all items
    axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/items`)
      .then(response => {
        setItems(response.data);
      })
      .catch(error => console.log(error));
  }, []);

  const handleAddItem = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/items`, { name, description });
      setItems([...items, response.data]);
      setName('');
      setDescription('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateItem = async () => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/items/${editId}`, { name, description });
      setItems(items.map(item => item.id === editId ? response.data : item));
      setName('');
      setDescription('');
      setEditId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/items/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const noItemsInfoMsg = <h4>Currently no item in the List, Add an Item to display</h4>

  const itemsList = items.map(item => (
    <li key={item.id}>
      <strong>{item.name}</strong>: {item.description}
      <button onClick={() => { setEditId(item.id); setName(item.name); setDescription(item.description); }}>Edit</button>
      <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
    </li>
  ))

  return (
    <div>
      <h1>Items List</h1>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={editId ? handleUpdateItem : handleAddItem}>
        {editId ? 'Update Item' : 'Add Item'}
      </button>

      <ul>
        { items.length === 0 ?  noItemsInfoMsg : itemsList }
      </ul>
    </div>
  );
};

export default App;
