## Todo

- How to undo the changes according to events?
- As Michael found, `seal`, `freeze` & `preventExtensions`  all trigger `preventExtensions` and `defineProperty`.
    - should support defineProperty?
    - advanced feature, hold on
    - definedProperty doesn't support parameter receiver. But we can save the receiver in `handler.get` & `handler.set`
- Similar concept: https://github.com/nx-js/observer-util
    - It doesn't use RxJS
- Override array methods (especially `unshift` & `splice`) to make them atomic
    - Or can we replace the current with completely new arr instead?
- There seem to be tooooo many GETs when changing an array
- Don't emit get "funciton" events?
