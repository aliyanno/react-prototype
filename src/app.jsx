var React = require('react');
var Router = require('./router').Router;
var Route = require('./router').Route;

var Tests = React.createClass({
  render: function() {
    return <div>
        <h1>Tests here</h1>
        <div>{this.props.params}</div>
      </div>;
  }
});

var App = React.createClass({
  render: function () {
    return (
      <div>
        <h1>App</h1>
        <Route pattern="/tests">
          <div>Hello</div>
          <Tests></Tests>
          <Route pattern="/hey">
            <Route pattern="/my">
              <h2>My</h2>
            </Route>
            <h1>Hey</h1>
            <Route pattern="/boy">
              <h3>Boy</h3>
            </Route>
          </Route>
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
