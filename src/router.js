var Reflux = require('reflux');
var React = require('react');
var RoutePattern = require('route-pattern');

require('babel/polyfill');

var HashChangeAction = Reflux.createAction();
var RequestHashAction = Reflux.createAction();

var CascadeMixin = {
  cascadePatternProps: function(){
    var children = this.props.children
    if(this._currentElement.type.displayName === 'Tests'){
      console.log('children', this);
    }
    if(children !== undefined){
      if(typeof children.forEach !== 'function'){
        children = [children];
      }
      children.filter(x => x.props !== undefined).forEach((child)=>{
        var childPattern = child.props.pattern || '';
        child.props.pattern = this.props.pattern + childPattern;
      });
    }
  },
  componentDidMount: function(){
    console.log('cascadePatternProps', this._currentElement.type.displayName);
    this.cascadePatternProps();
  }
};

var defaultConfig = {
  defaultRoute: '/'
};

class Router {
  constructor(config = defaultConfig) {
    this.config = config;
    window.addEventListener('hashchange', this.route.bind(this));
    this.patterns = [];
  }

  route(){
    var hash = this.getHash();
    
    var urlIsClean = this.urlIsClean(hash);

    if(!urlIsClean && this.lastHash !== hash){
      this.cleanUrl(hash);
    }else if(hash !== this.lastHash && this.running === true && urlIsClean){
      this.lastHash = hash;
      this.dispatchRoute(hash);
    }
  }

  getFragmentPatterns(hash){
    if(hash === undefined){
      hash = this.getHash();
    }
    var fragments = hash.split('/').filter(x => x.trim().length > 0).map(string => '/' + string);
    var fragmentPatterns = {};
    var pattern = '';

    fragments.forEach((fragment)=>{
      pattern+=fragment;
      var foundIndex = this.patterns.findIndex( pat => pat.routePattern.matches(pattern) );

      if(foundIndex > -1){
        fragmentPatterns[this.patterns[foundIndex].patternString] = this.patterns[foundIndex].routePattern.match(pattern);
        this.lastMatchedPattern = pattern;
      }
    });
    return fragmentPatterns;
  }

  getFragmentParams(patternString){
    var patterns = this.getFragmentPatterns();
    return patterns[patternString];
  }

  getHash(){
    return window.location.hash.substr(1);
  }

  dispatchRoute(hash){
    HashChangeAction(this.getFragmentPatterns(hash));
    setTimeout(this.defaultRedirect.bind(this), 1);
  }

  defaultRedirect(){
    this.redirect(this.lastMatchedPattern || this.config.defaultRoute);
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

  redirect(hash){
    if(hash !== this.getHash()){
      window.location.hash = hash;
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

var router = new Router({defaultRoute: '/tests'});

var RouteStore = Reflux.createStore({
  init: function(){
    this.listenTo(HashChangeAction, (fragmentPatterns) => {
      this.trigger.call(this, fragmentPatterns);
    });
    this.listenTo(RequestHashAction, ()=> {
      this.trigger.call(this, router.getFragmentPatterns());
    });
  }
});

var Route = React.createClass({
  mixins: [CascadeMixin],
  getInitialState: function(){
    return {
      routeMatches: false,
      params: []
    }
  },

  getState: function(fragments){
    if(fragments === undefined){
      fragments = router.getFragmentPatterns();
    }

    var fragmentParams = fragments[this.props.pattern];

    var result = {};
    if(fragmentParams){
      result.routeMatches = true;
      result.params = fragmentParams;
    }else{
      result.routeMatches = false;
      result.params = {};
    }
    return result;
  },

  onRouteChange: function(fragmentPatterns){
    this.setState(this.getState(fragmentPatterns));
  },

  componentDidMount: function(){
    router.register(this.props.pattern);
    this.unsubscribe = RouteStore.listen(this.onRouteChange);
    this.setState(this.getState());
  },

  componentWillUnMount: function(){
    router.unregister(this.props.pattern);
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
  Route: Route,
  CascadeMixin: CascadeMixin,
  RouteStore: RouteStore
};
