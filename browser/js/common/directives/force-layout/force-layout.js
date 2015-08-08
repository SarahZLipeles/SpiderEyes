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
            var width = 1200,
                height = 1200;

            var svg = d3.select(".graph")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("pointer-events", "all")
                .call(d3.behavior.zoom().on("zoom", function() {
                    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                }))
                .append('g');

            d3.json("graph.json", function(error, graph) {
                if (error) throw error;

                var force = d3.layout.force()
                    .gravity(.05)
                    .charge(-200)
                    .linkDistance(60)
                    .size([width, height])
                    .nodes(graph.nodes)
                    .links(graph.links)
                    .start();

                var link = svg.selectAll(".link")
                    .data(graph.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .attr("stroke-opacity", function(d) {
                        if (d.label == 'is a') {
                            return '0.8';
                        } else {
                            return '0.2';
                        }
                    })
                    .style("stroke-width", 6)
                    .style("stroke", function(d) {
                        if (d.color !== null) {
                            return d.color;
                        }
                    })
                    .on("mouseover", function() {
                        d3.select(this).style("stroke", "#999999").attr("stroke-opacity", "1.0");
                    })
                    .on("mouseout", function() {
                        d3.select(this)
                            .style("stroke", function(d) {
                                if (d.color !== null) {
                                    return d.color;
                                }
                            })
                            .attr("stroke-opacity", function(d) {
                                if (d.label == 'is a') {
                                    return '0.8';
                                } else {
                                    return '0.2';
                                }
                            });
                    });

                link.append("title")
                    .text(function(d) {
                        return d.label;
                    });


                var drag = force.drag()
                    .origin(function(d) {
                        return d;
                    })
                    .on("dragstart", function(d) {
                        d3.event.sourceEvent.stopPropagation();
                    })
                    .on("drag", function(d) {
                        d3.select(this)
                            .attr("x", d.x = d3.event.x)
                            .attr("y", d.y = d3.event.y);
                    })

                var node = svg.selectAll(".node")
                    .data(graph.nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .call(drag);

                node.append("circle")
                    .attr("r", function(d) {
                        if (d.size > 0) {
                            return 10 + (d.size * 2);
                        } else {
                            return 10;
                        }
                    })
                    .style("fill", function(d) {
                        // return color(d.group);
                        if (d.style == 'filled') {
                            return d.color;
                        }
                    })
                    .style("stroke", function(d) {
                        if (d.style !== 'filled') {
                            return d.color;
                        }
                    })
                    .style("stroke-width", "4")
                    .on("mouseover", function() {
                        d3.select(this).style("fill", "#999");
                    })
                    .on("mouseout", function(d) {
                        if (d.style == 'filled') {
                            d3.select(this).style("fill", d.color);
                        } else {
                            d3.select(this).style("stroke", d.color);
                            d3.select(this).style("fill", "black");
                        }
                    })

                node.append("text")
                    .attr("text-anchor", "middle")
                    // .style("color", "white", null)
                    // .attr("fill", "white")
                    .style("pointer-events", "none")
                    // .attr("font-size", function(d) {
                    //     if (d.color == '#b94431') {
                    //         return 10 + (d.size * 2) + 'px';
                    //     } else {
                    //         return "9px";
                    //     }
                    // })
                    // .attr("font-weight", function(d) {
                    //     if (d.color == '#b94431') {
                    //         return "bold";
                    //     } else {
                    //         return "100";
                    //     }
                    // })
                    .text(function(d) {
                        if (d.color == '#b94431') {
                            return d.id + ' (' + d.size + ')';
                        } else {
                            return d.id;
                        }
                    });

                node.append("title")
                    .text(function(d) {
                        return d.URI;
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
                        })
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });
                });
            });
        }
    };
});