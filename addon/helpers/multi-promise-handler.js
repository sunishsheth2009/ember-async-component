import Helper from '@ember/component/helper';
import { hashSettled } from 'rsvp';
/**
 * This is the multi-promise-handler helper. It allows for passing in multiple network requests, while offering the
 * ability to gracefully handle the response for each promise. The output would thus still leverage the suspense
 * component data schema, but embedded to each response, there will be an assigned state.
 * @example
 *   {{#suspense-component
 *     promise=(multi-promise-handler promiseOne=promise.first promiseTwo=promise.second)
 *     blockRender=false
 *     as |task|
 *   }}
 *     {{#if task.isLoading}}
 *       <div>Loading...</div>
 *     {{else if task.isSuccess}}
 *       {{#if (eq task.data.promiseOne.state "fulfilled")}}
 *         <div>{{task.data.promiseOne.value.userRequest.name}}
 *       {{else if (eq task.data.promiseOne.state "rejected"}}
 *         <div>Error: {{task.data.promiseOne.reason}}
 *       {{/if}}
 *
 *       {{#if (eq task.data.promiseTwo.state "fulfilled")}}
 *         <div>{{task.data.promiseTwo.value.userRequest.name}}
 *       {{else (eq if task.data.promiseTwo.state "rejected"}}
 *         <div>Error: {{task.data.promiseTwo.reason}}
 *       {{/if}}
 *     {{else if task.isError}}
 *       <div>Error occurred: {{task.errorReason}}</div>
 *     {{/if}}
 *   {{/suspense-component}}
 */
export default class MultiPromiseHandler extends Helper {
  compute(args, hash) {
    return hashSettled(hash);
  }
}
