ember-async-component
==============================================================================

This ember addon is used for building promise aware container components which
handles success, loading and error states. This component also works seemlessly
with [ember-cli-fastboot](https://github.com/ember-fastboot/ember-cli-fastboot)

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.12 or above
* Ember CLI v2.13 or above
* Node.js v10 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-async-component
```


Usage
------------------------------------------------------------------------------

This is the suspense component which be used to by container components when making API calls in a component. This component handles server side rendering issues and loading and error states out of the box for the consumer

@param {Function|object} [promise] Required promise for the component to render the loading, success and error state
@param {boolean} [blockRender] Default is false. Used for deciding if the fastboot server should wait for the API call to complete

```
{{#suspense-component
  promise=promise
  blockRender=false
  as |task|
}}
  {{#if task.isLoading}}
    Loading...
  {{else if task.isSuccess}}
    {{task.data.userRequest.name}}: {{task.data.userRequest.time}}
  {{else if task.isError}}
    Error occurred: {{task.errorReason}}
  {{/if}}
{{/suspense-component}}
```

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
