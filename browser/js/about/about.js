app.config(function($stateProvider) {

  // Register our *about* state.
  $stateProvider.state('about', {
    url: '/about',
    controller: 'AboutController',
    templateUrl: 'js/about/about.html',
  });
});

app.controller('AboutController', function() {
  // register our custom symbols to nvd3
  // make sure your path is valid given any size because size scales if the chart scales.
})

app.factory('AboutFactory', function() {
  return {}
})