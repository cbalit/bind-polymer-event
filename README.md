# bind-polymer-event

A simple Angularjs directive to listen to Polymer custom event in an angular application


```html
<my-polymer-elmt
             event-1="onEvent1()"
             event-2="ctrl.onEvent2($pEvent)"
             bind-polymer-event="event-1,event-2">             
</my-polymer-elmt>
```
