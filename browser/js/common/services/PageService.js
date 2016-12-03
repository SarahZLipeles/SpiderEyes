app.service("PageService", function($http) {
  this.randomData = function(groups, points) { //# groups,# points per group
    // smiley and thin-x are our custom symbols!
    var data = [],
      shapes = ['thin-x', 'circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
      random = d3.random.normal();
    for (var i = 0; i < groups; i++) {
      data.push({
        key: 'Group ' + i,
        values: []
      });
      for (var j = 0; j < points; j++) {
        data[i].values.push({
          x: random(),
          y: random(),
          size: Math.round(Math.random() * 100) / 100,
          shape: shapes[j % shapes.length]
        });
      }
    }
    return data;
  };

  this.getPages = function() {
    return $http.get("/api/pages")
      .then(function(pages) {
        pages = pages.data;
        console.log(pages);
        var data = [{
            values: []
          }],
          random = d3.random.normal();
        for (var i = 0; i < pages.length; i++) {
          data[0].values.push({
            x: ((Math.random() - 0.5) / (pages[i].pageRank) * 4),
            y: ((Math.random() - 0.5) / (pages[i].pageRank) * 4),
            size: pages[i].pageRank,
            shape: 'circle'
          });
        }
        console.log(data);
        return data;
      });
  };
});