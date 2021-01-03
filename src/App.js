import './App.css';
import React, { useState, useEffect } from 'react';
import { Link, withRouter } from 'react-router-dom';

const  App = (props) => {

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

        fetch('http://localhost:4000/users/login', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: username,
                password: password
            })
        })
        .then(response => {
            if (response.ok) {
              alert('User logged in successfully.')
            } else {
              alert('User Not Found! Create a user first to log in.')
            }
            return response
        })
        .then(data => console.log(data))
        .catch(error => console.log(error))
    }

  return (
    <div className="container">
        <div>Log In</div>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input type="text" value={username} name="username" onChange={handleChange('username')}></input>

          <label>Password</label>
          <input type="password" value={password} onChange={handleChange('password')} name="password"></input>

          <button>Sign In</button>

        </form>
        <Link to="/signup">Don't have an account yet? Signup.</Link>
    </div>
  );
}

export default withRouter(App);
