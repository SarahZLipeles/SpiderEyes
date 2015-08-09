app.directive('forceLayout', function(PageService) {
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {
            showsearch: '@',
            jsonfile: '@'
        }, // {} = isolate, true = child, false/undefined = no change
        controller: function($scope) {
            $scope.searchNode = function() {
                var selectedVal = document.getElementById('search').value;
                // var selectedEndVal = document.getElementById('searchEnd').value;
                // console.log("end", selectedEndVal === "")
                var node = $scope.svg.selectAll(".node");
                var selectedNode = node.filter(function(d) {
                    return d.id === selectedVal;
                });
                // console.log(selectedNode[0])

                // var path = []
                // path.push(selectedNode[0])

                var link = $scope.svg.selectAll(".link")
                    // var links = link.filter(function(l) {
                    //     return l.source === selectedNode.index
                    // })
                    // console.log(links)


                var unselected = node.filter(function(d) {
                    return d.id !== selectedVal; // && d.id !== selectedEndVal;
                });
                unselected.style("opacity", "0");

                link.style("opacity", "0");

                d3.selectAll(".node, .link").transition()
                    .duration(5000)
                    .style("opacity", 1);


                $scope.svg.attr("transform", "translate(" + (-parseInt(selectedNode.attr("cx")) + $scope.width / 2) + "," + (-parseInt(selectedNode.attr("cy")) + $scope.height / 2) + ")" + " scale(" + 1 + ")");
            }
        },
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        templateUrl: 'js/common/directives/force-layout/force-layout.html',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope) {
            $scope.width = $(".graph-container").width();
            $scope.height = window.innerHeight - 150;
            if ($scope.showsearch) $scope.height -= 50
            $scope.jsonfile = $scope.jsonfile || "graph.json";
            $scope.showsearch = $scope.showsearch === "true";

            var force = d3.layout.force()
                .gravity(0.05)
                .charge(-200)
                .linkDistance(60)
                .size([$scope.width, $scope.height])

            $scope.svg = d3.select(".graph")
                .append("svg")
                .attr("width", $scope.width)
                .attr("height", $scope.height)
                .attr("pointer-events", "all")
                .call(d3.behavior.zoom().on("zoom", function() {
                    $scope.svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                }))
                .append('g');

            d3.json($scope.jsonfile, function(error, json) {
                if (error) throw error;

                force
                    .nodes(json.nodes)
                    .links(json.links)
                    .start();

                var link = $scope.svg.selectAll(".link")
                    .data(json.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .attr("stroke-opacity", 0.2)
                    .style("stroke-width", 6)

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

                var node = $scope.svg.selectAll(".node")
                    .data(json.nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .call(drag);

                //---Hover on node, fade unconnected nodes---
                var linkedByIndex = {};
                json.links.forEach(function(d) {
                    linkedByIndex[d.source.index + "," + d.target.index] = 1;
                });

                function isConnected(a, b) {
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

                //---node circles---
                node.append("circle")
                    .attr("r", function(d) {
                        return Math.sqrt(d.size) + 20;
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
                    .on("mouseout", fade(1))
                    // .on("click", function() {
                    // })

                //---node text---
                node.append("text")
                    .attr("class", "text")
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .attr("stroke-width", "0")
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
                    .on("mouseout", textFade(1))
                    // .on("click", function() {
                    //     d3.select(this).text(function(d) {
                    //         return d.id
                    //     })
                    // });

                //---node tooltip
                node.append("title")
                    .text(function(d) {
                        return "Pagerank: " + d.size + "\n\n" + d.URI;
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

                    node.each(collide(0.5));
                });

                //---Search---
                var optArray = [];
                for (var i = 0; i < json.nodes.length - 1; i++) {
                    optArray.push(json.nodes[i].id);
                }

                optArray = optArray.sort();

                $(function() {
                    $("#search").autocomplete({
                        source: optArray
                    });
                });

                //---collision avoidance---
                var padding = 1, // separation between circles
                    maxRadius = Math.sqrt(400) + 20;

                function collide(alpha) {
                    var quadtree = d3.geom.quadtree(json.nodes);
                    return function(d) {
                        var rb = Math.sqrt(d.size) + 20 + maxRadius + padding,
                            nx1 = d.x - rb,
                            nx2 = d.x + rb,
                            ny1 = d.y - rb,
                            ny2 = d.y + rb;

                        quadtree.visit(function(quad, x1, y1, x2, y2) {
                            if (quad.point && (quad.point !== d)) {
                                var x = d.x - quad.point.x,
                                    y = d.y - quad.point.y,
                                    l = Math.sqrt(x * x + y * y);
                                if (l < rb) {
                                    l = (l - rb) / l * alpha;
                                    d.x -= x *= l;
                                    d.y -= y *= l;
                                    quad.point.x += x;
                                    quad.point.y += y;
                                }
                            }
                            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                        });
                    };
                }
            });
        }
    };
});