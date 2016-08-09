describe('[EOS] binPolymerEvent directive controller', function(){
  beforeEach(angular.mock.module('app'));

  var compile;
  var $controller;
  var divElement;
  var scope;
  var defaultData;
  var validTemplate=  '<div '+
      'custom-event-1="onEvent1($pEvent)" '+
      'custom-event-2="onEven2($pEvent,name)" '+
      'bind-polymer-event="custom-event-1,custom-event-2">'+
      '</div>';

  function createDirective(data, template) {
      var elm;

      // Setup scope state
      scope.data = data || defaultData;

      // Create directive
      elm = compile(template || validTemplate)(scope);

      // Trigger watchers
      scope.$apply();

      // Return
      return elm;
    }

  beforeEach(angular.mock.inject(function($compile, $rootScope){
      compile = $compile;
      scope = $rootScope.$new();
      //Reset default
      defaultData={name:'John'};
    }));


  describe("Controller API",function(){

    beforeEach(function(){
      divElement = createDirective();
      $controller = divElement.controller('bindPolymerEvent');
    });

    it('should have a controller', function(){
      expect($controller).toBeDefined();
    });

    describe("Get Scope property",function () {
      var val;

      it('should return null if there is no parameters', function(){
        val=$controller.getScopeProperty();
        expect(val).toBeNull();
      });

      it('should return null if we pass an empty string', function(){
        val=$controller.getScopeProperty('');
        expect(val).toBeNull();
      });

      it('should return null if we pass a property that does not exixt on the scope', function(){
        val=$controller.getScopeProperty('aprop');
        expect(val).toBeNull();
      });

      it('should return the scope property according to the passing name', function(){
        scope.foo='bar';
        val=$controller.getScopeProperty('foo');
        expect(val).toBe('bar');
      });

      it('should return the scope property according to the passing name', function(){
        scope.foo='bar';
        val=$controller.getScopeProperty('foo');
        expect(val).toBe('bar');
      });

      it('should retrieve the value in a chain object', function(){
        scope.foo={
          bar:'faz'
        };
        val=$controller.getScopeProperty('foo.bar');
        expect(val).toBe('faz');
      });

      it('should return null if one of the chain property does not exist', function(){
        scope.foo={
          bar:'faz'
        };
        val=$controller.getScopeProperty('foo.unknow.bar');
        expect(val).toBeNull();
      });

    });

    describe("set attribute name to camel case",function () {
      var val;

      it('should return null if there is no parameters', function(){
        val=$controller.toCamelCase();
        expect(val).toBeNull();
      });

      it('should return null if we pass an empty string', function(){
        val=$controller.toCamelCase('');
        expect(val).toBeNull();
      });

      it('should remove - and add uppercase', function(){
        val=$controller.toCamelCase('my-event-custom');
        expect(val).toBe('myEventCustom');
      });

      it('should remove - and add uppercase even with a number', function(){
        val=$controller.toCamelCase('my-event-1');
        expect(val).toBe('myEvent1');
      });

      it('should not change a string without -', function(){
        val=$controller.toCamelCase('myeventcustom');
        expect(val).toBe('myeventcustom');
      });

      it('should work with first -', function(){
        val=$controller.toCamelCase('-my-event-1');
        expect(val).toBe('MyEvent1');
      });
    });

    describe("set attribute name to snake case",function () {
      var val;

      it('should return null if there is no parameters', function(){
        val=$controller.toSnakeCase();
        expect(val).toBeNull();
      });

      it('should return null if we pass an empty string', function(){
        val=$controller.toSnakeCase('');
        expect(val).toBeNull();
      });

      it('should add - in front upperCase', function(){
        val=$controller.toSnakeCase('myEventCustom');
        expect(val).toBe('my-event-custom');
      });

      it('should not change a string without uppercase', function(){
        val=$controller.toSnakeCase('myeventcustom');
        expect(val).toBe('myeventcustom');
      });

      it('should not add a - in front if the first letter is uppercase', function(){
        val=$controller.toSnakeCase('MyEvent');
        expect(val).toBe('my-event');
      });
    });

    describe('looking for a function context', function () {
      var val;

      it('should return null if there is no parameters', function(){
        val=$controller.getFunctionContext();
        expect(val).toBeNull();
      });

      it('should return null if we pass an empty string', function(){
        val=$controller.getFunctionContext('');
        expect(val).toBeNull();
      });

      it('should return null if there is no context', function(){
        val=$controller.getFunctionContext('myFunction()');
        expect(val).toBeNull();
      });

      it('should return null if the parameter is not a function call', function(){
        val=$controller.getFunctionContext('myFunction(');
        expect(val).toBeNull();
      });

      it('should return the scope reference if there is a context', function(){
        var myRef={};
        scope.myRef=myRef;
        val=$controller.getFunctionContext('myRef.myFunction()');
        expect(val).toBe(myRef);
      });

      it('should retrieve the value in a chain object if there is a context', function(){
        var myRef={};

        scope.myRef={
          myRef2:myRef
        };
        val=$controller.getFunctionContext('myRef.myRef2.myFunction()');
        expect(val).toBe(myRef);
      });

      it('should return null it the context does not exist on the scope', function(){
        val=$controller.getFunctionContext('myRef.myFunction()');
        expect(val).toBeNull();
      });

    });

    describe('looking for a function name', function () {
      var val;

      it('should return null if there is no parameters', function(){
        val=$controller.getFunctionName();
        expect(val).toBeNull();
      });

      it('should return null if we pass an empty string', function(){
        val=$controller.getFunctionName('');
        expect(val).toBeNull();
      });

      it('should return null if the parameter is not a function call', function(){
        val=$controller.getFunctionName('myFunction(');
        expect(val).toBeNull();
      });

      it('should return the scope reference of the function', function(){
        var myfunction= function () {};
        scope.myFunction=myfunction;
        val=$controller.getFunctionName('myFunction()');
        expect(val).toBe(myfunction);
      });


      it('should return null if the scope reference does not exist', function(){
        val=$controller.getFunctionName('myFunction2()');
        expect(val).toBeNull();
      });


      it('should return the reference of the function even in a chain hierarchy', function(){
        var myfunction= function () {};
        scope.myObj={
          myFunction:myfunction
        };
        val=$controller.getFunctionName('myObj.myFunction()');
        expect(val).toBe(myfunction);
      });

      it('should return null if one element in the hierarchy does not exist', function(){
        var myfunction= function () {};
        scope.myObj={
          myFunction:myfunction
        };
        val=$controller.getFunctionName('myObj.unknow.myFunction()');
        expect(val).toBeNull();
      });

    });

    describe('looking for function arguments', function () {
      var val;

      it('should return null if there is no parameters', function(){
        val=$controller.getFunctionArgs();
        expect(val).toBeNull();
      });

      it('should return null if we pass an empty string', function(){
        val=$controller.getFunctionArgs('');
        expect(val).toBeNull();
      });

      it('should return an empty array if there is no arguments', function(){
        val=$controller.getFunctionArgs('myFunction()');
        expect(val).toEqual([]);
      });

      it('should return the scope reference of the arguments', function(){
        scope.arg1="arg1";
        scope.arg2="arg2";
        val=$controller.getFunctionArgs('myFunction(arg1,arg2)');
        expect(val).toEqual(["arg1","arg2"]);
      });


      it('should return an array with a null value if the scope reference does not exist', function(){
        val=$controller.getFunctionArgs('myFunction(arg1)');
        expect(val).toEqual([null]);
      });


      it('should return the value of the argument even in a chain hierarchy', function(){
        scope.myObj={
          arg1:"arg1"
        };
        val=$controller.getFunctionArgs('myFunction(myObj.arg1)');
        expect(val).toEqual(["arg1"]);
      });

      it('should return an array with a null value if one element in the hierarchy does not exist', function(){
        scope.myObj={
          arg1:"arg1"
        };
        val=$controller.getFunctionArgs('myFunction(myObj.unknow.arg1)');
        expect(val).toEqual([null]);
      });

    });
  });

});
