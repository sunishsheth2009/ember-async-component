import Helper from '@ember/component/helper';

/**
 * This is the multi-promise-handler helper. It allows for passing in multiple network requests, while offering the
 * ability to gracefully handle the response for each promise. The output would thus still leverage the suspense
 * component data schema, but embedded to each response, there will be an assigned state.
 * @example
 *   {{#suspense-component
 *     promise=(ember-async-component$multi-promise-handler promiseOne=promise.first promiseTwo=promise.second)
 *     blockRender=false
 *     as |task|
 *   }}
 *     {{#if task.isLoading}}
 *       <div>Loading...</div>
 *     {{else if task.isSuccess}}
 *       {{#if task.data.promiseOne.isSuccess}}
 *         <div>{{task.data.promiseOne.data.userRequest.name}}
 *       {{else if task.data.promiseOne.isError}}
 *         <div>Error: {{task.data.promiseOne.errorReason}}
 *       {{/if}}
 * 
 *       {{#if task.data.promiseTwo.isSuccess}}
 *         <div>{{task.data.promiseTwo.data.userRequest.name}}
 *       {{else if task.data.promiseTwo.isError}}
 *         <div>Error: {{task.data.promiseTwo.errorReason}}
 *       {{/if}}
 *     {{else if task.isError}}
 *       <div>Error occurred: {{task.errorReason}}</div>
 *     {{/if}}
 *   {{/suspense-component}}
 */
export default Helper.extend({
  promiseCallback(promises, payload) {
    if (promises.length) {
      const [currentPromiseCategory, currentPromise] = promises.pop();
      return currentPromise
      .then((resolvedPromise) => this.successCallback(resolvedPromise, promises, currentPromiseCategory, payload))
      .catch((resolvedPromise) => this.failCallback(resolvedPromise, promises, currentPromiseCategory, payload));
    }
    return payload;
  },
  successCallback(resolvedPromise, promises, category, payload) {
    payload[category] = {
      data: resolvedPromise,
      isSuccess: true,
      isError: false,
      errorReason: null
    }
    return this.promiseCallback(promises, payload);
  },
  failCallback(resolvedPromise, promises, category, payload) {
    payload[category] = {
      data: null,
      isSuccess: false,
      isError: true,
      errorReason: resolvedPromise
    }
    return this.promiseCallback(promises, payload);
  },
  compute(args, promisesObj) {
    const promises = Object.entries(promisesObj);
    return this.promiseCallback(promises, {});
  }
});