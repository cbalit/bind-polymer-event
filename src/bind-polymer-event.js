'use strict';

BindPolymerController.$inject = ['$scope'];
function BindPolymerController($scope) {

  this.toCamelCase = function(eventName) {
    if(!eventName){
      return null;
    }
    return eventName.replace(/\.?(-[a-z,0-9])/g, function (x, y) {
      return y.charAt(1).toUpperCase();
    }).replace(/^-/, "");
  };

  this.toSnakeCase = function(eventName) {
    if(!eventName){
      return null;
    }

    return eventName.replace(/\.?([A-Z])/g, function (x, y) {
      return "-" + y.toLowerCase()
    }).replace(/^-/, "");
  };

  this.getFunctionName = function(fct) {
    if(!fct){
      return null;
    }
    //We look for the function name
    var _match = fct.match(/(.*)\(.*\)/);
    //Find the reference to the function in the scope
    if(_match && _match[1]){
      return this.getScopeProperty(_match[1]);
    }
    return null;
  };

  this.getFunctionContext = function(fct) {
    if(!fct){
      return null;
    }
    //We look for the function name
    var _match = fct.match(/(.*)\..*\(.*\)/);
    //We remove the function name
    if(_match && _match[1]){
      return this.getScopeProperty(_match[1]);
    }
    return null;
  };

  this.getFunctionArgs = function(fct) {
    if(!fct){
      return null;
    }
    //We look for the function arguments
    var _match = fct.match(/.*\((.*)\)/);
    var values = [];
    if(_match && _match[1]){
      var args = _match[1].split(',');
      for (var i = 0; i < args.length; i++) {
        //For each argument name we find the correct value in the scope
        values.push(this.getScopeProperty(args[i]));
      }
    }
    return values;
  };


  this.getScopeProperty = function(property) {
    if(!property){
      return null;
    }
    var props = property.split('.');
    var val = $scope;
    for (var i = 0; i < props.length; i++) {
      var key=props[i];
      if(val[key]){
        val = val[key];
      }
      else{
        return null;
      }
    }
    return val || null;
  };
}


angular.module('app')
  .directive('bindPolymerEvent', function () {
    return {
      restrict: 'A',
      scope: false,
      controller: BindPolymerController,
      link: function bindPolymerEventLink(scope, element, attrs,ctrl) {
        //Callback Map
        var cbMap={};
        //Get Event list
        if(attrs['bindPolymerEvent']){
            var events = attrs['bindPolymerEvent'].split(',');

          //For each event we need to retrieve the callback function
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            // we need both camelCasedProperties and snake-case-properties
            var snakeEvent = ctrl.toSnakeCase(event);
            var camelEvent = ctrl.toCamelCase(event);

            var strCallback = attrs[camelEvent];
            if(strCallback){
              cbMap[snakeEvent] = {
                  cb:ctrl.getFunctionName(strCallback),
                  name:strCallback
              };

              element.on(snakeEvent, function (event) {
                //Save polymer event on scope
                scope.$pEvent = event;
                //get Args
                var args = ctrl.getFunctionArgs(cbMap[event.type].name);
                var context = ctrl.getFunctionContext(cbMap[event.type].name) || scope;
                var cb =  cbMap[event.type].cb;
                scope.$apply(function () {
                  cb.apply(context, args);
                });
              });
            }
          }
        }
      }
    };
  });
