var Reflux = require('reflux');
var React = require('react');

var HashChangeAction = Reflux.createAction();

class Router {
  constructor() {
    window.addEventListener('hashchange', this.route.bind(this));
    this.routes = [];
  }

  route(){
    console.log('hashchange', this.running, this);
    var hash = location.hash.substr(1);
    if(this.running === true){
      HashChangeAction(hash);
    }
  }

  register(hash) {
    if(this.hashes.indexOf(hash) > -1){
      this.routes.push(hash);
    }
  }

  unregister(hash){
    var index = this.hashes.indexOf(hash);
    if(index > -1){
      this.routes.splice(index, 1);
    }
  }

  run(){
    this.running = true;
    this.route()
  }

  stop(){
    this.running = false;
  }
}

var RouteStore = Reflux.createStore({
  init: function(){
    this.listenTo(HashChangeAction, (route) => {
      this.trigger(route);
    });
  }
});

var Route = React.createClass({
  getInitialState: function(){
    return {
      routeMatches: false
    };
  },
  onRouteChange: function(hash){
    this.setState({routeMatches: this.props.path !== undefined && this.props.path === hash});
  },
  componentDidMount: function(){
    this.unsubscribe = RouteStore.listen(this.onRouteChange);
  },
  componentWillUnMount: function(){
    this.unsubscribe();
  },
  render: function(){
    if(this.state.routeMatches){
      return <div> {this.props.children} </div>;
    }else{
      return null;
    }
  }
});

module.exports = {
  Router: Router,
  Route: Route
}
