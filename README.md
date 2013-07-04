MyEvents
========

Simple NodeJS Event Module based on Underscore.Events implementation

MyEvents generally provide interfaces to an Promise Factory, where a simple Promise/A instance is created.
Promise can be treated as simple datatype for managing events or callbacks. It make sures any callback that bound to it will be fired,
regardless the time of event-binding. This is because Promise treat an event as immutable object. Once an event is fired as "fulfilled" or "rejected", Promise will keep the state of the event until the Promise is erased or the application stop. This behaviour will ensure
that developers won't miss any events in regards of asynchronous programming difficulties.
