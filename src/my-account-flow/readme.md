# my-account-flow

<!-- Auto Generated Below -->

## Events

| Event           | Description                                | Type                         |
| --------------- | ------------------------------------------ | ---------------------------- |
| `closeModal`    |                                            | `CustomEvent<any>`           |
| `FlowCompleted` |                                            | `CustomEvent<any>`           |
| `FlowStarted`   | Events to handle flow start and completion | `CustomEvent<any>`           |
| `HEvent`        | Events                                     | `CustomEvent<HEventPayload>` |

## Methods

### `close() => Promise<void>`

Closes the flow

#### Returns

Type: `Promise<void>`

## Dependencies

### Used by

- [app](../app)

### Depends on

- [step-controller](../step-controller)
- [step](../step)
- [tab-controller](../tab-controller)
- [my-account-edit-personal](../my-account-edit-personal)
- [my-account-edit-professional](../my-account-edit-professional)
- [my-account-password](../my-account-password)
- context-consumer

### Graph

```mermaid
graph TD;
  my-account-flow --> step-controller
  my-account-flow --> step
  my-account-flow --> tab-controller
  my-account-flow --> my-account-edit-personal
  my-account-flow --> my-account-edit-professional
  my-account-flow --> my-account-password
  my-account-flow --> context-consumer
  step-controller --> header
  step-controller --> step-indicator
  header --> icon
  step --> button
  step --> context-consumer
  button --> H-button
  button --> icon
  my-account-edit-personal --> step
  my-account-edit-personal --> input
  my-account-edit-personal --> icon
  my-account-edit-personal --> checkbox
  my-account-edit-personal --> context-consumer
  input --> icon
  input --> H-input
  H-input --> H-validation-hint
  H-validation-hint --> H-icon
  checkbox --> H-checkbox
  checkbox --> icon
  H-checkbox --> H-icon
  my-account-edit-professional --> select
  my-account-edit-professional --> icon
  my-account-edit-professional --> us-input-license
  my-account-edit-professional --> input
  my-account-edit-professional --> step
  my-account-edit-professional --> context-consumer
  select --> H-select
  select --> H-select-option
  select --> icon
  H-select --> H-icon
  us-input-license --> input
  us-input-license --> icon
  us-input-license --> select
  us-input-license --> context-consumer
  my-account-password --> step
  my-account-password --> input-password
  my-account-password --> password
  input-password --> input
  input-password --> icon
  password --> input-password
  app --> my-account-flow
  style my-account-flow fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
