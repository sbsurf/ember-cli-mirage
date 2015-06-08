import { capitalize } from 'ember-cli-mirage/utils/inflector';
import Association from './association';

export default Association.extend({

  // The model type that holds/owns this association
  possessor: '',

  // The model type this association refers to
  referent: '',

  /*
    The belongsTo association adds a fk to the possessor of the association
  */
  getForeignKeyArray: function() {
    return [this.referent, `${this.possessor}_id`];
  },

  getForeignKey: function() {
    return `${this.possessor}_id`;
  },

  addMethodsToModel: function(model, key, schema) {
    this._model = model;
    this._key = key;

    var association = this;
    var foreignKey = this.getForeignKey();
    var relationshipIdsKey = association.referent + '_ids';

    var associationHash = {};
    associationHash[key] = this;
    model.hasManyAssociations = _.assign(model.hasManyAssociations, associationHash);
    model.associationKeys.push(key);
    model.associationIdKeys.push(relationshipIdsKey);

    Object.defineProperty(model, relationshipIdsKey, {
      /*
        object.children_ids
          - returns an array of the associated children's ids
      */
      get: function() {
        if (this.isNew()) {
          var tempModels = association._tempChildren || [];
          return tempModels.map(function(child) {return child.id;});
        } else {

        }
        // debugger;

        // return this[key].map(function(child) { return child.id; });
        // debugger;
    //     return this.attrs[foreignKey];
      },

      /*
        object.children_ids = ([childrenIds...])
          - sets the associated parent (via id)
      */
      set: function(ids) {
        if (this.isNew()) {
          association._tempChildren = schema[association.referent].find(ids);

        } else {
          // var col = schema[association.referent].find(ids);
          // col.update(foreignKey, this.id);
        }
        // debugger;
        return this;
        // if (id && !schema[_this.referent].find(id)) {
        //   throw "Couldn't find " + _this.referent + " with id = " + id;
        // }

        // this.attrs[foreignKey] = id;
        // return this;
      }
    });

    Object.defineProperty(model, key, {
      /*
        object.children
          - returns an array of associated children
      */
      get: function() {
        var tempModels = association._tempChildren || [];

        if (this.isNew()) {
          return tempModels;

        } else {
          var query = {};
          query[foreignKey] = this.id;
          var savedModels = schema[association.referent].where(query);

          return savedModels.mergeCollection(tempModels);
        }

        // var foreignKeyId = this[foreignKey];
        // if (foreignKeyId) {
        //   _this._tempParent = null;
        //   return schema[_this.referent].find(foreignKeyId);

        // } else if (_this._tempParent) {
        //   return _this._tempParent;
        // } else {
        //   return null;
        // }
      },

      /*
        object.children = (childModels)
          - sets the associated children (via array of models)
      */
      set: function(newModels) {
        if (this.isNew()) {
          association._tempChildren = _.compact(newModels);
        }
        // if (newModel && newModel.isNew()) {
        //   this[foreignKey] = null;
        //   _this._tempParent = newModel;
        // } else if (newModel) {
        //   _this._tempParent = null;
        //   this[foreignKey] = newModel.id;
        // } else {
        //   _this._tempParent = null;
        //   this[foreignKey] = null;
        // }
      }
    });

    /*
      object.newChild
        - creates a new unsaved associated child
    */
    model['new' + capitalize(association.referent)] = function(attrs) {
      var child = schema[association.referent].new(attrs);

      association._tempChildren = _.compact(association._tempChildren) || [];
      association._tempChildren.push(child);

      return child;
    };

    /*
      object.createChild
        - creates an associated child, persists directly to db
    */
    model['create' + capitalize(association.referent)] = function(attrs) {
      var child = schema[association.referent].create(attrs);

      association._tempChildren = _.compact(association._tempChildren) || [];
      association._tempChildren.push(child);

      return child;
    };

    this.updateChildForeignKeys = this._updateChildForeignKeys.bind(this, model, key);
  },

  _updateChildForeignKeys: function(model, key) {
    debugger;

    var fk = this.getForeignKey();
    model[key].update(fk, model.attrs.id);
  }
});
