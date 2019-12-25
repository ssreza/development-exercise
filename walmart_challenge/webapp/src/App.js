import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'react-bulma-components/dist/react-bulma-components.min.css';

import Home from "./Home";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink
} from "react-router-dom";
function App() {
  
  return (
    <Router>
    <div className="app-body">
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-menu">
          <div className="navbar-start">
            <span className="navbar-item"><Link to="/" >
                Home
              </Link></span>
              <span className="navbar-item"> 
              <Link to="/orders" className="navbar-item">Orders</Link>
              </span>
          </div>
        </div>
      </nav>
      <hr />
      <Switch>
        <Route exact path="/">
          <Home/>
        </Route>
        <Route path="/orders">
          <div>Orders</div>
        </Route>
      
      </Switch>
    </div>
  </Router>
  );
}

export default App;
