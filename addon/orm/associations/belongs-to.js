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
    return [this.possessor, `${this.referent}_id`];
  },

  getForeignKey: function() {
    return `${this.referent}_id`;
  },

  addMethodsToModel: function(model, key, schema) {
    var association = this;
    var foreignKey = this.getForeignKey();

    model.associationKeys.push(key);
    model.associationIdKeys.push(foreignKey);

    Object.defineProperty(model, this.getForeignKey(), {
      /*
        object.parent_id
          - returns the associated parent's id
      */
      get: function() {
        return this.attrs[foreignKey];
      },

      /*
        object.parent_id = (parentId)
          - sets the associated parent (via id)
      */
      set: function(id) {
        if (id && !schema[association.referent].find(id)) {
          throw "Couldn't find " + association.referent + " with id = " + id;
        }

        this.attrs[foreignKey] = id;
        return this;
      }
    });

    Object.defineProperty(model, key, {
      /*
        object.parent
          - returns the associated parent
      */
      get: function() {
        var foreignKeyId = this[foreignKey];
        if (foreignKeyId) {
          association._tempParent = null;
          return schema[association.referent].find(foreignKeyId);

        } else if (association._tempParent) {
          return association._tempParent;
        } else {
          return null;
        }
      },

      /*
        object.parent = (parentModel)
          - sets the associated parent (via model)
      */
      set: function(newModel) {
        if (newModel && newModel.isNew()) {
          this[foreignKey] = null;
          association._tempParent = newModel;
        } else if (newModel) {
          association._tempParent = null;
          this[foreignKey] = newModel.id;
        } else {
          association._tempParent = null;
          this[foreignKey] = null;
        }
      }
    });

    /*
      object.newParent
        - creates a new unsaved associated parent
    */
    model['new' + capitalize(key)] = function(attrs) {
      var parent = schema[key].new(attrs);

      this[key] = parent;

      return parent;
    };

    /*
      object.createParent
        - creates an associated parent, persists directly to db
    */
    model['create' + capitalize(key)] = function(attrs) {
      var parent = schema[key].create(attrs);

      this[foreignKey] = parent.id;

      return parent;
    };
  }

});
