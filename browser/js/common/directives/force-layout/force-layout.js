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

            $scope.update = function() {

                $scope.force.start();

                var link = $scope.svg.selectAll(".link")
                    .data($scope.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .attr("stroke-opacity", 0.2)
                    .style("stroke-width", 6);

                var drag = $scope.force.drag()
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
                    });

                var node = $scope.svg.selectAll(".node")
                    .data($scope.nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .call(drag);

                //---Hover on node, fade unconnected $scope.nodes---
                var linkedByIndex = {};
                $scope.links.forEach(function(d) {
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
                                        return d.id;
                                    });
                            } else {
                                d3.select(this).select("text")
                                    .attr("font-size", "9px")
                                    .text(function(d) {
                                        return d.id.substring(0, 10) + "...";
                                    });
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
                        return Math.sqrt(d.size) + 10;
                    })
                    .attr("class", "nodeStrokeClass")
                    .style("stroke", function(d) {
                        if (d.size > 100) {
                            return "#b94431";
                        } else if (d.size > 20) {
                            return "#da991c";
                        } else if (d.size > 3) {
                            return "#ffffff";
                        } else {
                            return "#5b5b5b";
                        }
                    })
                    .style("stroke-width", "4")
                    .on("mouseover", fade(0.3))
                    .on("mouseout", fade(1));
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
                        return d.id.substring(0, 10) + "...";
                    })
                    .on("mouseover", textFade(0.3))
                    .on("mouseout", textFade(1));
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

                $scope.force.on("tick", function() {
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
                for (var i = 0; i < $scope.nodes.length - 1; i++) {
                    optArray.push($scope.nodes[i].id);
                }

                optArray = optArray.sort();

                $(function() {
                    $("#search").autocomplete({
                        source: optArray
                    });
                });

                //---collision avoidance---
                var padding = 1, // separation between circles
                    maxRadius = Math.sqrt(250) + 10;

                function collide(alpha) {
                    var quadtree = d3.geom.quadtree($scope.nodes);
                    return function(d) {
                        var rb = Math.sqrt(d.size) + 10 + maxRadius + padding,
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



            };



            socket.on("link", function(data) {
                // {source: page._id, target: childPage._id}
                console.log("RECIEVED");
            });
            socket.on("newNode", function(data) {
                // page={}
                addNode({
                    id: data.title,
                    size: pageRank,
                    _id: data._id
                })
            });
            socket.on("grow", function(data) {
                // page._id
                console.log("RECIEVED");
            });


            // Add and remove elements on the graph object
            var addNode = function(nodeObj) {
                $scope.nodes.push(nodeObj);
                $scope.update();
            };

            var updateNode = function(nodeId) {
                $scope.nodes.forEach(function(node) {
                    if (node._id === nodeId) {
                        node.size++;
                    }
                });
                $scope.update();
            };

            // var removeNode = function(id) {
            //     var i = 0;
            //     var n = findNode(id);
            //     while (i < $scope.links.length) {
            //         if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
            //             $scope.links.splice(i, 1);
            //         } else i++;
            //     }
            //     $scope.nodes.splice(findNodeIndex(id), 1);
            //     update();
            // };

            // var removeLink = function(source, target) {
            //     for (var i = 0; i < $scope.links.length; i++) {
            //         if (links[i].source.id == source && $scope.links[i].target.id == target) {
            //             $scope.links.splice(i, 1);
            //             break;
            //         }
            //     }
            //     update();
            // };

            // var removeallLinks = function() {
            //     $scope.links.splice(0, $scope.links.length);
            //     update();
            // };

            // var removeAllNodes = function() {
            //     $scope.nodes.splice(0, $scope.links.length);
            //     update();
            // };

            var addLink = function(source_id, target_id) {
                $scope.links.push({
                    "source": findNode(source_id),
                    "target": findNode(target_id)
                });
                $scope.update();
                keepNodesOnTop();
            };

            var findNode = function(_id) {
                for (var i in $scope.nodes) {
                    if (nodes[i]._id === _id) return $scope.nodes[i];
                }
            };

            function keepNodesOnTop() {
                $(".nodeStrokeClass").each(function(index) {
                    var gnode = this.parentNode;
                    gnode.parentNode.appendChild(gnode);
                });
            }

            // var findNodeIndex = function(_id) {
            //     for (var i = 0; i < $scope.nodes.length; i++) {
            //         if (nodes[i]._id == _id) {
            //             return i;
            //         }
            //     }
            // };



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

                var link = $scope.svg.selectAll(".link");
                // var $scope.links = link.filter(function(l) {
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
            };
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
            if ($scope.showsearch) $scope.height -= 50;
            $scope.jsonfile = $scope.jsonfile || "graph.json";
            $scope.showsearch = $scope.showsearch === "true";

            $scope.force = d3.layout.force()
                .gravity(0.1)
                .charge(-200)
                .linkDistance(50)
                .size([$scope.width, $scope.height]);

            //0.5,-2000: 25s
            //0.05,-200: 20s
            //0.005,-20: 21s
            //0.1,-200:
            //0.1,-200,50:15s
            // console.log("scale", d3.event.scale)
            var zoom = d3.behavior.zoom()
                .translate([700, 400])
                .scale(0.3);

            $scope.svg = d3.select(".graph")
                .append("svg")
                .attr("width", $scope.width)
                .attr("height", $scope.height)
                .attr("pointer-events", "all")
                .call(d3.behavior.zoom().on("zoom", function() {
                    $scope.svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                }))
                .append('g')
                .attr("transform", "translate(700,400)scale(0.3,0.3)");

            d3.json($scope.jsonfile, function(error, json) {
                if (error) throw error;
                $scope.force.links(json.links);
                $scope.force.nodes(json.nodes);
                $scope.nodes = $scope.force.nodes();
                $scope.links = $scope.force.links();

                $scope.update();

            });
        }
    };
});