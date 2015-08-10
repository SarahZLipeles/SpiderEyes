app.config(function($stateProvider) {
  $stateProvider.state('docs', {
    url: '/doc/:case',
    templateUrl: 'js/docs/docs.html',
    controller: function($scope, $stateParams) {
      // console.log($stateParams)
      if ($stateParams.case === 'javascript1') {
        $scope.title = "en.wikipedia.com/wiki/javascript"
        $scope.jsonfile = "graph60.json"
      } else if ($stateParams.case === 'javascript2') {
        $scope.title = "en.wikipedia.com/wiki/javascript"
        $scope.jsonfile = "graph30.json"
      } else {
        $scope.title = "en.wikipedia.com/wiki/jesus"
        $scope.jsonfile = "jesus_joanna.json"
      }
    }
  });
});