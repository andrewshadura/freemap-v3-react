import Main from './main.jsx';
import React from 'react';
import ReactDOM from 'react-dom';
var Locations = Router.Locations
var Location = Router.Location
import { hashHistory, Router, Route } from 'react-router'

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/:mapType/:zoom/:lat/:lon" component={Main}></Route>
    <Route path="/" component={Main}></Route>
  </Router>
), document.getElementById('app'))