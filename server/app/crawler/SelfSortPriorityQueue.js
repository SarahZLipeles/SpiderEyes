
var Promise = require('bluebird');

function SortedArray() {
    this.array = [];
}

SortedArray.prototype.add = function(value, id, data) {
    console.log("adding to array");
    var node = new Node(value, id, data);
    if(this.array.length === 0) return this.array.push(node);
    for (var i = 0; i < this.array.length; i++) {
        if(node.value <= this.array[i].value) {
            var latterHalf = this.array.splice(i);
            this.array = this.array.push(node).concat(latterHalf);
            return node;
        }
    }
};

SortedArray.prototype.update = function(id, valueToAdd) {
    for (var i = 0; i < this.array.length; i++) {
        if(id === this.array[i].id) {
            var latterHalf = this.array.splice(i);
            var node = latterHalf.unshift();
            node.value += valueToAdd;
            this.array = this.array.concat(latterHalf);
            this.add(node);
        }
    }
};

SortedArray.prototype.pop = function() {
    return this.array.pop();
};


function Node(value, id, data) {
    this.value = value;
    this.id = id;
    this.data = data;
}

function SelfSortPriorityQueue(options) {

    options = options || {};
    this.concurrency = options.concurrency || 1;
    this.delay = options.delay || 0;
    this.max = options.max;
    this.queue = new SortedArray();
    this.queueWorking = [];
}

SelfSortPriorityQueue.prototype.addToWorkingQueue = function() {
    console.log("add to wq");
    this.queueWorking.push(this.queue.pop());
    this.queueWorking[this.queueWorking.length - 1]();
};

SelfSortPriorityQueue.prototype.start = function() {
    console.log("started q");
    var self = this;
    for (var i = 0; i < this.queueWorking.length; i++) {
        this.queueWorking[i]();
    }
    return new Promise(function(resolve, reject) {
        self.finish = resolve;
        self.err = reject;
    });
};



SelfSortPriorityQueue.prototype.add = function(node) {
    console.log("adding to q");
    var self = this;
    if(Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) {
            self.add(node[i]);
        }
    }else if(!node) {
        return;
    }else if(node.promise) {
        if(typeof node.promise.then === 'function') {
            node.promise.then(function() {
                self.addToWorkingQueue();
                if (this.queueWorking.length === 0) self.finish();
            });
            self.queue.add(node.pageRank, node._id, node.promise);
            if(this.queueWorking < this.concurrency) {
                self.addToWorkingQueue();
            }
            if(self.max) {
                if(self.queue.array.length > self.max) {
                    self.queue.array.unshift();
                }
            }
        }
    }
};


SelfSortPriorityQueue.prototype.stop = function() {
    this.finish();
    this.queueWorking = [];
    this.queue = new SortedArray();
};


module.exports = SelfSortPriorityQueue;

var SSPPQ = new SelfSortPriorityQueue();

