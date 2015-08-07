app.directive('scatterPlot', function(PageService) {
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {}, // {} = isolate, true = child, false/undefined = no change
    // controller: function($scope, $element, $attrs, $transclude) {},
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
    // template: '',
    templateUrl: 'js/common/directives/chart/chart.html',
    // replace: true,
    // transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, elm, attrs) {
      nv.utils.symbolMap.set('thin-x', function(size) {
        size = Math.sqrt(size);
        return 'M' + (-size / 2) + ',' + (-size / 2) +
          'l' + size + ',' + size +
          'm0,' + -(size) +
          'l' + (-size) + ',' + size;
      });
      // create the chart
      var chart;
      nv
      .addGraph(function() {
        chart = nv.models.scatterChart()
          .useVoronoi(true)
          .height(600)
          .width(1200)
          .color(d3.scale.category10().range())
          .duration(300);
        chart.dispatch.on('renderEnd', function() {
          console.log('render complete');
        });
        chart.xAxis.tickFormat(d3.format('.02f'));
        chart.yAxis.tickFormat(d3.format('.02f'));
        PageService.getPages().then(function(data) {
          d3.select('#test1 svg')
            .datum(data)
            .call(chart);
          console.log(d3.selectAll("circle"));
              // .attr("x", function(d) { return x(d.x); })
              // .attr("y", function(d) { return y(d.y); })
              // .text("fooLabelsOfScatterPoints");
          // for (var i = 0; i < data.length; i++) {
          //   d3.select('svg')
          //     .append('line')
          //     .attr({
          //       x1: lines[l].x1,
          //       y1: lines[l].y1,
          //       x2: lines[l].x2,
          //       y2: lines[l].y2,
          //       stroke: '#000'
          //     });
          // }
        });
        // nv.utils.windowResize(chart.update);
        chart.dispatch.on('stateChange', function(e) {
          console.log('New State:', JSON.stringify(e));
        });
        return chart;
      });
    }
  };
});