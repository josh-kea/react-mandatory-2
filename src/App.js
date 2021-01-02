import './App.css';
import React, { useState, useEffect } from 'react';

function App() {

  const [state, setState] = useState( {
    username: '',
    password: ''
  })

  const username = state.username
  const password = state.password

  function handleChange(stateProperty) {
    return function(event) {
      setState({ ...state, [stateProperty]: event.target.value })
    };
};

    const handleSubmit = event => {
      event.preventDefault();
      console.table({ username, password })

    }

  return (
    <div className="App">
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input type="text" value={username} name="username" onChange={handleChange('username')}></input>

          <label>Password</label>
          <input type="password" value={password} onChange={handleChange('password')} name="password"></input>

          <button>Sign In</button>

        </form>
    </div>
  );
}

export default App;
