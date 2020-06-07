import { getOwner } from '@ember/application';
import Component from '@glimmer/component';
import Ember from 'ember';
import IS_BROWSER from '../../utils/is-browser';
import { tracked } from '@glimmer/tracking';

/**
 * This is the suspense component which be used to by container components when making API calls in a component.
 * This component handles server side rendering issues and loading and error states out of the box for the consumer
 * @param {Function|object} [promise] Required promise for the component to render the loading, success and error state
 * @param {boolean} [blockRender] Default is false. Used for deciding if the fastboot server should wait for the API call to complete
 * ...
 * @example
 *   <Suspense
 *     @promise={{this.promise}}
 *     @blockRender={{false}}
 *     as |task|
 *   >
 *     {{#if task.isLoading}}
 *       Loading...
 *     {{else if task.isSuccess}}
 *       {{task.data.userRequest.name}}: {{task.data.userRequest.time}}
 *     {{else if task.isError}}
 *       Error occurred: {{task.errorReason}}
 *     {{/if}}
 *   </Suspense>
 */

class Task {
  @tracked data = null;
  @tracked errorReason = null;
  @tracked isLoading = false;

  get isError() {
    return Boolean(this.errorReason);
  }

  get isSuccess() {
    return Boolean(this.data);
  }
}

export default class Suspense extends Component {
  blockRender = false;
  promise = null;

  constructor() {
    super(...arguments);

    // Recommended way to get the service in the addons and not forcing fastboot for every consuming application
    // https://ember-fastboot.com/docs/addon-author-guide#accessing-the-fastboot-service
    this.fastboot = getOwner(this).lookup('service:fastboot');
  }

  get data() {
    const blockRender = this.args.blockRender || false;
    const promise = this.args.promise;

    return this.execute(promise, blockRender);
  }

  execute(promiseArg, blockRender) {
    const task = new Task();
    let promise = typeof promiseArg === 'function' ? promiseArg() : promiseArg;

    if (this.promise === promise) {
      return this.task;
    }

    this.task = task;
    this.promise = promise;
    if (!IS_BROWSER && !blockRender) {
      // we are not supposed to block rendering on the server
      return null;
    }

    task.isLoading = true;

    if (blockRender && this.fastboot.isFastBoot) {
      // https://github.com/ember-fastboot/ember-cli-fastboot#delaying-the-server-response
      this.fastboot.deferRendering(promise);
    }

    promise.then(
      (payload) => {
        task.data = payload;
        task.isLoading = false;
      },
      (e) => {
        task.errorReason = e;
        task.isLoading = false;
        // https://github.com/emberjs/ember.js/issues/15569
        if (!Ember.testing) {
          throw e;
        }
      }
    );

    return task;
  }
}
