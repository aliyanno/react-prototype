var React = require('react');
var Router = require('./router').Router;
var Route = require('./router').Route;

var App = React.createClass({
  render: function () {
    return (
      <div>
        <h1>App</h1>
        <Route pattern="/tests">
          <h1>Tests here</h1>
        </Route>
        <Route pattern="/">
          <h1>Dashboard</h1>
        </Route>
      </div>
    );
  }
});

React.render(<App/>, document.getElementById('root'));
Router.run();
