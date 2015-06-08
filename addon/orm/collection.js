import Ember from 'ember';

/*
  An array of models, returned from one of the schema query
  methods (all, find, where). Knows how to update and destroy its models.
*/
var Collection = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  if (Ember.isArray(args[0])) {
    args = args[0];
  }
  this.push.apply(this, args);

  this.update = function(key, val) {
    this.forEach(function(model) {
      model.update(key, val);
    });
  };

  this.destroy = function() {
    this.forEach(function(model) {
      model.destroy();
    });
  };

  this.save = function() {
    this.forEach(function(model) {
      model.save();
    });
  };

  this.mergeCollection = function(collection) {
    var _this = this;

    collection.forEach(function(model) {
      _this.push(model);
    });

    return this;
  };

  return this;
};

Collection.prototype = Object.create(Array.prototype);

export default Collection;
