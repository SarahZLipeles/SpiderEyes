app.directive('forceLayout', function(PageService) {
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
        templateUrl: 'js/common/directives/force-layout/force-layout.html',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, elm, attrs) {


            // var graph = "graph.json";

            // var width = 1200,
            //     height = 1200;

            // // r = 10;

            // // var vis = d3.select(".graph")
            // //     .append("svg:svg")
            // //     .attr("width", w)
            // //     .attr("height", h)
            // //     .attr("pointer-events", "all")
            // //     .append('svg:g')
            // //     .call(d3.behavior.zoom().on("zoom", redraw))
            // //     .append('svg:g');

            // // vis.append('svg:rect')
            // //     .attr('width', w)
            // //     .attr('height', h)
            // //     .attr('fill', 'rgba(1,1,1,0)');

            // // function redraw() {
            // //     console.log("here", d3.event.translate, d3.event.scale);
            // //     vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
            // // }

            // var force = d3.layout.force()
            //     // .gravity(0.05)
            //     .charge(-200)
            //     .linkDistance(60)
            //     .size([width, height]);

            // var svg = d3.select(".graph")
            //     .append("svg")
            //     .attr("width", width)
            //     .attr("height", height)
            //     // .attr("pointer-events", "all")
            //     // .append('g')
            //     // .call(d3.behavior.zoom().on("zoom", redraw))
            //     // .append('g')
            //     // .append('rect')

            // // var svg = d3.select(".text").append("svg")
            // //     .attr("width", w)
            // //     .attr("height", h);

            // d3.json(graph, function(error, json) {

            //     if (error) throw error;

            //     force
            //         .nodes(json.nodes)
            //         .links(json.links)
            //         .start();


            //     var link = svg.selectAll(".link")
            //         .data(json.links)
            //         .enter().append("line")
            //         .attr("class", "link")
            //         .attr("stroke-opacity", function(d) {
            //             if (d.label == 'is a') {
            //                 return '0.8';
            //             } else {
            //                 return '0.2';
            //             }
            //         })
            //         .attr("stroke-width", "6")
            //         .style("stroke", function(d) {
            //             if (d.color !== null) {
            //                 return d.color;
            //             }
            //         })
            //         .on("mouseover", function() {
            //             d3.select(this).style("stroke", "#999999").attr("stroke-opacity", "1.0");
            //         })
            //         .on("mouseout", function() {
            //             d3.select(this).style("stroke", function(d) {
            //                 if (d.color !== null) {
            //                     return d.color;
            //                 }
            //             }).attr("stroke-opacity", function(d) {
            //                 if (d.label == 'is a') {
            //                     return '0.8';
            //                 } else {
            //                     return '0.2';
            //                 }
            //             });
            //         });

            //     link.append("title")
            //         .text(function(d) {
            //             return d.label;
            //         });

            //     var node = svg.selectAll(".node")
            //         .data(json.nodes)
            //         .enter().append("circle")
            //         .attr("class", "node")
            //         .attr("r", function(d) {
            //             if (d.size > 0) {
            //                 return 10 + (d.size * 2);
            //             } else {
            //                 return 10;
            //             }
            //         })
            //         .style("fill", function(d) {
            //             if (d.style == 'filled') {
            //                 return d.color;
            //             }
            //         })
            //         .style("stroke", function(d) {
            //             if (d.style !== 'filled') {
            //                 return d.color;
            //             }
            //         })
            //         .style("stroke-width", "4")
            //         .on("mouseover", function() {
            //             d3.select(this).style("fill", "#999");
            //         })
            //         .on("mouseout", function(d) {
            //             if (d.style == 'filled') {
            //                 d3.select(this).style("fill", d.color);
            //             } else {
            //                 d3.select(this).style("stroke", d.color);
            //                 d3.select(this).style("fill", "black");
            //             }
            //         })
            //         .call(force.drag);

            //     node.append("text")
            //         .attr("text-anchor", "middle")
            //         .attr("fill", "white")
            //         .style("pointer-events", "none")
            //         .attr("font-size", function(d) {
            //             if (d.color == '#b94431') {
            //                 return 10 + (d.size * 2) + 'px';
            //             } else {
            //                 return "9px";
            //             }
            //         })
            //         .attr("font-weight", function(d) {
            //             if (d.color == '#b94431') {
            //                 return "bold";
            //             } else {
            //                 return "100";
            //             }
            //         })
            //         .text(function(d) {
            //             if (d.color == '#b94431') {
            //                 return d.id + ' (' + d.size + ')';
            //             } else {
            //                 return d.id;
            //             }
            //         });

            //     node.append("title")
            //         .text(function(d) {
            //             return d.URI;
            //         });


            //     force.on("tick", function() {
            //         node.attr("cx", function(d) {
            //                 return d.x;
            //             })
            //             .attr("cy", function(d) {
            //                 return d.y;
            //             })
            //             .attr("transform", function(d) {
            //                 return "translate(" + d.x + "," + d.y + ")";
            //             });

            //         link.attr("x1", function(d) {
            //                 return d.source.x;
            //             }).attr("y1", function(d) {
            //                 return d.source.y;
            //             })
            //             .attr("x2", function(d) {
            //                 return d.target.x;
            //             })
            //             .attr("y2", function(d) {
            //                 return d.target.y;
            //             });
            //     })
            // });
            // 



            var width = 960,
                height = 500;

            var color = d3.scale.category20();

            var force = d3.layout.force()
                .charge(-120)
                .linkDistance(30)
                .size([width, height]);

            var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);

            d3.json("miserables.json", function(error, graph) {
                if (error) throw error;

                force
                    .nodes(graph.nodes)
                    .links(graph.links)
                    .start();

                var link = svg.selectAll(".link")
                    .data(graph.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .style("stroke-width", function(d) {
                        return Math.sqrt(d.value);
                    });

                var node = svg.selectAll(".node")
                    .data(graph.nodes)
                    .enter().append("circle")
                    .attr("class", "node")
                    .attr("r", 5)
                    .style("fill", function(d) {
                        return color(d.group);
                    })
                    .call(force.drag);

                node.append("title")
                    .text(function(d) {
                        return d.name;
                    });

                force.on("tick", function() {
                    link.attr("x1", function(d) {
                            return d.source.x;
                        })
                        .attr("y1", function(d) {
                            return d.source.y;
                        })
                        .attr("x2", function(d) {
                            return d.target.x;
                        })
                        .attr("y2", function(d) {
                            return d.target.y;
                        });

                    node.attr("cx", function(d) {
                            return d.x;
                        })
                        .attr("cy", function(d) {
                            return d.y;
                        });
                });
            });



        }
    };

});