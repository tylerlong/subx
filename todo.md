## Todo

- How to undo the changes according to events?
- As Michael found, `seal`, `freeze` & `preventExtensions`  all trigger `preventExtensions` and `defineProperty`.
    - should support defineProperty?
    - advanced feature, hold on
    - definedProperty doesn't support parameter receiver. But we can save the receiver in `handler.get` & `handler.set`
- Rename it
    - Max: 'Current X'
    - Max: actuate
- Similar concept: https://github.com/nx-js/observer-util
    - It doesn't use RxJS
