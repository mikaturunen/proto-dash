/* global console, require, __dirname, process, module */
/* jshint node: true */
/* jshint esnext: true */

var _ = require("lodash");
var mongo = require("mongodb");
var ObjectID = mongo.ObjectID;

/** 
 * Transformers the array of resulting component documents into the rows x columns format specified in the dashboard
 * that rows_component_ids represent with pure englighted magic and unicorns.
 * @param {string[][]} rows_component_ids 2d array with the first layer being rows and the second dimension being columns
 * @returns Components transformed into the replica of rows_component_ids but instead of id's, the actual objects
 */
var componentsIntoRows = (rows_component_ids) => {
    return (results) => {
        // don't ask, I'm just throwing some map magic at it. Basically what is being done is I want the actual objects
        // to represent the rows in the exact same format as rows_component_ids are. So rows_component_ids describe
        // the format for us and we just fill in the details with the map magic and store the component objects in the 
        // exactly same format as the rows_component_ids is: Array<Array<Object>>, number or rows and colums is dynamic
        
        return rows_component_ids.map(rowColumns => {
            return rowColumns.map(component_id => { 
                // we make sure that we never get undefined into the collection. Makes our life a little easier on front
                var component = _.find(results, componentDocument => {
                    return componentDocument._id.equals(component_id);
                }) || { }; 
               return component;
            });
        });
    };
};

module.exports = componentsIntoRows;