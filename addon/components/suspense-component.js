import { getOwner } from "@ember/application";
import Component from "@glimmer/component";
import Ember from "ember";
import IS_BROWSER from "ember-async-component/utils/is-browser";
import { tracked } from "@glimmer/tracking";

/**
 * This is the suspense component which be used to by container components when making API calls in a component.
 * This component handles server side rendering issues and loading and error states out of the box for the consumer
 * @param {Function|object} [promise] Required promise for the component to render the loading, success and error state
 * @param {boolean} [blockRender] Default is false. Used for deciding if the fastboot server should wait for the API call to complete
 * ...
 * @example
 *   {{#suspense-component
 *     promise=promise
 *     blockRender=false
 *     as |task|
 *   }}
 *     {{#if task.isLoading}}
 *       Loading...
 *     {{else if task.isSuccess}}
 *       {{task.data.userRequest.name}}: {{task.data.userRequest.time}}
 *     {{else if task.isError}}
 *       Error occurred: {{task.errorReason}}
 *     {{/if}}
 *   {{/suspense-component}}
 */
export default class SuspenseComponent extends Component {
  blockRender = false;
  promise = null;
  @tracked isLoading;
  @tracked task = {
    data: null,
    isSuccess: false,
    isError: false,
    errorReason: null,
  };

  constructor() {
    super(...arguments);

    // Recommended way to get the service in the addons and not forcing fastboot for every consuming application
    // https://ember-fastboot.com/docs/addon-author-guide#accessing-the-fastboot-service
    this.fastboot = getOwner(this).lookup("service:fastboot");

    const blockRender = this.args.blockRender || false;
    this.execute(blockRender);
  }

  // didReceiveAttrs() {
  //   super.didReceiveAttrs(...arguments);
  // }

  updateComponentValue(scopedPromised) {
    return (
      scopedPromised === this.args.promise &&
      !this.isDestroyed &&
      !this.isDestroying
    );
  }

  execute(blockRender) {
    debugger;
    if (!IS_BROWSER && !blockRender) {
      // we are not supposed to block rendering on the server
      return null;
    }

    this.isLoading = true;
    const promiseOrCallback = this.args.promise;
    let promise;

    if (typeof promiseOrCallback === "function") {
      promise = promiseOrCallback();
    } else {
      promise = promiseOrCallback;
    }

    if (blockRender && this.get("fastboot.isFastBoot")) {
      // https://github.com/ember-fastboot/ember-cli-fastboot#delaying-the-server-response
      this.fastboot.deferRendering(promise);
    }

    return promise
      .then((payload) => {
        if (this.updateComponentValue(promiseOrCallback)) {
          this.task = Object.assign(this.task, {
            data: payload,
            isSuccess: true,
            isError: false,
            errorReason: null,
          });
        }

        return payload;
      })
      .catch((e) => {
        if (this.updateComponentValue(promiseOrCallback)) {
          this.task = Object.assign(this.task, {
            data: null,
            isSuccess: false,
            isError: true,
            errorReason: e,
          });
        }

        // https://github.com/emberjs/ember.js/issues/15569
        if (!Ember.testing) {
          throw e;
        }
      })
      .finally(() => {
        if (this.updateComponentValue(promiseOrCallback)) {
          this.isLoading = false;
        }
      });
  }
}
