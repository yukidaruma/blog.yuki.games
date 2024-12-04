```ts
if (process.env.FUNCTIONS_EMULATOR) {
  // These function are used only for local development
  exports.fetchSchedules = functions.https.onCall(fetchSchedulesImpl);
}
```
