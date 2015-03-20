var Reflux = require('reflux');
var React = require('react');
var RoutePattern = require('route-pattern');

require('babel/polyfill');

var HashChangeAction = Reflux.createAction();

class Router {
  constructor() {
    window.addEventListener('hashchange', this.route.bind(this));
    this.patterns = [];
  }

  route(){
    var hash = window.location.hash.substr(1);
    var urlIsClean = this.urlIsClean(hash);

    if(!urlIsClean && this.lastHash !== hash){
      this.cleanUrl(hash)
    }else if(hash !== this.lastHash && this.running === true && urlIsClean){
      this.lastHash = hash;
      this.dispatchRoute(hash);
    }
  }

  dispatchRoute(hash){
    console.log(this.patterns);
    var foundIndex = this.patterns.findIndex( pat => pat.routePattern.matches(hash) );
    if(foundIndex > -1){
      HashChangeAction(this.patterns[foundIndex].patternString, this.patterns[foundIndex].routePattern.match());
    }else{
      this.route('/');
    }
  }

  urlIsClean(fragment) {
    if(fragment[0] !== '/'){
      return false;
    }else if(fragment.length > 1 && fragment[fragment.length-1] === '/'){
      return false;
    }
    return true;
  }

  cleanUrl(fragment) {
    if(fragment[0] !== '/'){
      fragment = '/' + fragment;
    }else if(fragment.length > 1 && fragment[fragment.length-1] === '/'){
      fragment = fragment.substr(0, fragment.length-1);
    }
    this.redirect(fragment);
  }

  register(patternString){
    var foundIndex = this.patterns.findIndex(x => x.patternString === patternString )
    if(foundIndex > -1){
      this.patterns[foundIndex].count++;
    }else{
      this.patterns.push({
        routePattern: RoutePattern.fromString(patternString),
        patternString: patternString,
        count: 1
      });
    }
  }

  unregister(pattern){
    var foundIndex = this.patterns.findIndex( x => x.patternString === patternString );

    if(foundIndex > -1){
      this.patterns[foundIndex].count--
      if(this.patterns[foundIndex].count <= 0){
        this.patterns.splice(foundIndex, 1);
      }
    }
  }

  redirect(fragment){
    window.location.hash = fragment;
  }

  run(){
    this.running = true;
    this.route()
  }

  stop(){
    this.running = false;
  }
}

var router = new Router();

var RouteStore = Reflux.createStore({
  init: function(){
    this.listenTo(HashChangeAction, () => {
      this.trigger.apply(this, arguments);
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
    console.log('args', arguments);
    //    var matches = this.routePattern.match(hash);
    //    var doesMatch = this.routePattern.matches(hash);
    //    console.log('matches', matches);
    //    console.log('doesMatch', doesMatch);
    //    this.setState({routeMatches: this.routePattern.match(hash)});
  },
  componentDidMount: function(){
    this.routePattern = RoutePattern.fromString(this.props.pattern);
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
  Router: router,
  Route: Route
}
