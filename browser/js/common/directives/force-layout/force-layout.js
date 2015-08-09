app.directive('forceLayout', function(PageService) {
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {
            jsonfile: '@',
            width: '=',
            height: '=',
            searchTerm: '='
        }, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        templateUrl: 'js/common/directives/force-layout/force-layout.html',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, elm, attrs) {

            var width = $scope.width || 1200,
                height = $scope.height || 800,
                jsonfile = $scope.jsonfile || "graph.json";

            var force = d3.layout.force()
                .gravity(0.05)
                .charge(-200)
                .linkDistance(60)
                .size([width, height]);

            var svg = d3.select(".graph")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("pointer-events", "all")
                .call(d3.behavior.zoom().on("zoom", function() {
                    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                }))
                .append('g');

            d3.json(jsonfile, function(error, json) {
                if (error) throw error;
                force
                    .nodes(json.nodes)
                    .links(json.links)

                .start();

                var link = svg.selectAll(".link")
                    .data(json.links)
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
                        d3.select(this)
                            .style("stroke", "#999999")
                            .attr("stroke-opacity", "1.0");
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
                    .data(json.nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .call(drag);

                node.append("circle")
                    .attr("r", function(d) {
                        return Math.sqrt(d.size * 10) * 5;
                    })
                    .style("stroke", function(d) {
                        if (d.size > 10) {
                            return "#b94431"
                        } else if (d.size > 1.5) {
                            return "#da991c"
                        } else if (d.size > 0.3) {
                            return "#ffffff"
                        } else {
                            return "#5b5b5b"
                        }
                    })
                    .style("stroke-width", "4")
                    .on("mouseover", fade(0.3))
                    //function() {
                    // d3.select(this).style("fill", "#999");
                    //})
                    .on("mouseout", fade(1))
                    //     function(d) {
                    //     d3.select(this)
                    //         .style("stroke", function(d) {
                    //             if (d.size > 10) {
                    //                 return "#b94431"
                    //             } else if (d.size > 1.5) {
                    //                 return "#da991c"
                    //             } else if (d.size > 0.3) {
                    //                 return "#ffffff"
                    //             } else {
                    //                 return "#333333"
                    //             }
                    //         });
                    //     d3.select(this).style("fill", "black");
                    // })
                    // .on("click", function() {

                // })

                node.append("text")
                    .attr("class", "text")
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .attr("stroke-width", "0")
                    // .style("pointer-events", "none")
                    .attr("font-size", function(d) {
                        if (d.color == '#b94431') {
                            return 10 + (d.size * 2) + 'px';
                        } else {
                            return "9px";
                        }
                    })
                    .attr("font-weight", function(d) {
                        if (d.color == '#b94431') {
                            return "bold";
                        } else {
                            return "100";
                        }
                    })
                    .text(function(d) {
                        return d.id.substring(0, 20) + "...";
                    })
                    .on("mouseover", textFade(0.3))
                    //     function() {
                    //     d3.select(this)
                    //         .attr("font-size", function(d) {
                    //             return "14px"
                    //         })
                    //         .text(function(d) {
                    //             return d.id
                    //         })
                    // })
                    .on("mouseout", textFade(1))
                    //  function(d) {
                    //     d3.select(this)
                    //         .attr("font-size", function(d) {
                    //             return "9px"
                    //         })
                    //         .text(function(d) {
                    //             return d.id.substring(0, 20) + "...";
                    //         })
                    // })

                // .on("click", function() {
                //     d3.select(this).text(function(d) {
                //         return d.id
                //     })
                // });

                node.append("title")
                    .text(function(d) {
                        return d.URI;
                    });

                var linkedByIndex = {};
                json.links.forEach(function(d) {
                    console.log(d.source.index)
                    linkedByIndex[d.source.index + "," + d.target.index] = 1;
                });

                function isConnected(a, b) {
                    console.log("here")
                    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
                }

                function fade(opacity) {
                    return function(d) {
                        node.style("stroke-opacity", function(o) {
                            var thisOpacity = isConnected(d, o) ? 1 : opacity;
                            this.setAttribute('fill-opacity', thisOpacity);
                            return thisOpacity;
                        });

                        link.style("stroke-opacity", function(o) {
                            return o.source === d || o.target === d ? 1 : opacity;
                        });
                    };
                }

                function textFade(opacity) {
                    return function(d) {
                        node.style("stroke-opacity", function(o) {
                            var thisOpacity = isConnected(d, o) ? 1 : opacity;
                            this.setAttribute('fill-opacity', thisOpacity);
                            if (opacity < 1 && isConnected(d, o)) {
                                d3.select(this).select("text")
                                    .attr("font-size", "14px")
                                    .text(function(d) {
                                        return d.id
                                    });
                            } else {
                                d3.select(this).select("text")
                                    .attr("font-size", "9px")
                                    .text(function(d) {
                                        return d.id.substring(0, 20) + "...";
                                    })
                            }
                            return thisOpacity;
                        });

                        link.style("stroke-opacity", function(o) {
                            return o.source === d || o.target === d ? 1 : opacity;
                        });
                    };
                }

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