app.config(function($stateProvider) {
  // Register our *about* state.
  $stateProvider.state('about', {
    url: '/about',
    controller: 'AboutController',
    templateUrl: 'js/about/about.html',
  });
});

app.controller('AboutController', function($scope, AboutFactory) {
  // register our custom symbols to nvd3
  // make sure your path is valid given any size because size scales if the chart scales.
  $scope.isCrawling = false;

  

  $scope.crawl = function(startingUrl) {
    $scope.isCrawling = true;
    console.log("hi");
    AboutFactory.crawl(startingUrl);
  };

  $scope.stop = function() {
    $scope.isCrawling = false;
    AboutFactory.stop();
  };
});

app.factory('AboutFactory', function($http) {
  return {
    crawl: function(startingUrl) {
      $http.post('/api/crawl', {
          startingUrl: startingUrl
        })
        .then(function(res) {
          console.log(res);
        });
    },
    stop: function() {
      $http.get('/api/crawl/stop')
        .then(function(res) {
          console.log(res);
        });
    }
  };
})