var React = require('react');
var Router = require('./router').Router;
var Route = require('./router').Route;
var RouteStore = require('./router').RouteStore;
var CascadeMixin = require('./router').CascadeMixin;

var TestView = React.createClass({
  getInitialState: function(){
    return {
      loading: true
    };
  },

  setId: function(){
    var state = this.state;
    var params = this.getParams();
    state.id = params.namedParams.id;
    this.setState(state);
    console.log('state', state);
  },

  getParams: function(){
    return Router.getFragmentParams(this.props.pattern);
  },

  onRouteChange: function(){
    this.setId();
  },

  componentDidMount: function(){
    this.unsubscribe = RouteStore.listen(this.onRouteChange);
    this.setId();
  },

  componentDidUnmount: function(){
    this.unsubscribe();
  },

  render: function(){
    console.log('id', this.state.id);
    return <strong>Hey there this is a test {this.state.id}</strong>;
  }
});

var Tests = React.createClass({
  render: function() {
    return <div>
        <h1>Tests here</h1>
        <Route pattern={this.props.pattern + '/:id'}>
          <TestView/>
        </Route>
      </div>;
  }
});

var App = React.createClass({
  render: function () {
    return (
      <div>
        <Route pattern="/tests">
          <h1>Tests</h1>
          <Route pattern="/hey">
            <h1>Hey</h1>
          </Route>
          <Route pattern="/boy">
            <h1>Boy</h1>
          </Route>
        </Route>
      </div>
    );
  }
});

React.render(<App/>, document.getElementById('root'));
Router.run();
