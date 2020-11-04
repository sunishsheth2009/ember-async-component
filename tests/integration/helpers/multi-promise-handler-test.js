import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { defer as Defer } from 'rsvp';

module('Integration | Helper | multi-promise-handler', function (hooks) {
  setupRenderingTest(hooks);

  test('Component renders multiple successfully resolved promises as expected', async function (assert) {
    const loadingSelector = '[data-test-async-loading]';
    const errorSelector = '[data-test-async-error]';
    const dataSelectorOne = '[data-test-async-success-one]';
    const dataSelectorTwo = '[data-test-async-success-two]';
    this.deferredOne = new Defer();
    this.deferredPromiseOne = this.deferredOne.promise;
    this.deferredTwo = new Defer();
    this.deferredPromiseTwo = this.deferredTwo.promise;
    await render(hbs`
      <Suspense
        @promise={{multi-promise-handler promiseOne=deferredPromiseOne promiseTwo=deferredPromiseTwo}}
        as |task|
      >
        {{#if task.isLoading}}
          <div data-test-async-loading>
            Loading...
          </div>
        {{else if task.isSuccess}}
          {{#if task.data.promiseOne.isSuccess}}
            <div data-test-async-success-one>
              {{task.data.promiseOne.data.name}}
            </div>
          {{/if}}
          {{#if task.data.promiseTwo.isSuccess}}
            <div data-test-async-success-two>
              {{task.data.promiseTwo.data.name}}
            </div>
          {{/if}}
        {{else if task.isError}}
          <div data-test-async-error>
            Error message...
          </div>
        {{/if}}
      </Suspense>
    `);
    assert.dom(loadingSelector).exists('loading is rendered');
    this.deferredOne.resolve({
      name: 'Harry Potter'
    });
    this.deferredTwo.resolve({
      name: 'Hermoine Granger'
    });
    await waitUntil(() => !find(loadingSelector));
    assert
      .dom(loadingSelector)
      .doesNotExist('Expected loading to not be rendered');
    assert.dom(errorSelector).doesNotExist('Expected error to not be rendered');
    assert
      .dom(dataSelectorOne)
      .hasText('Harry Potter', 'success section is rendered');
      assert
      .dom(dataSelectorTwo)
      .hasText('Hermoine Granger', 'success section is rendered');
  });

  test('Component renders partially successfully batches as expected', async function (assert) {
    const loadingSelector = '[data-test-async-loading]';
    const dataSelectorOne = '[data-test-async-success-one]';
    const dataSelectorTwo = '[data-test-async-success-two]';
    const dataErrorSelectorTwo = '[data-test-async-error-two]';
    this.deferredOne = new Defer();
    this.deferredPromiseOne = this.deferredOne.promise;
    this.deferredTwo = new Defer();
    this.deferredPromiseTwo = this.deferredTwo.promise;
    await render(hbs`
      <Suspense
        @promise={{multi-promise-handler promiseOne=deferredPromiseOne promiseTwo=deferredPromiseTwo}}
        as |task|
      >
        {{#if task.isLoading}}
          <div data-test-async-loading>
            Loading...
          </div>
        {{else if task.isSuccess}}
          {{#if task.data.promiseOne.isSuccess}}
            <div data-test-async-success-one>
              {{task.data.promiseOne.data.name}}
            </div>
          {{/if}}
          {{#if task.data.promiseTwo.isSuccess}}
            <div data-test-async-success-two>
              {{task.data.promiseTwo.data.name}}
            </div>
          {{else if task.data.promiseTwo.isError}}
            <div data-test-async-error-two>
              {{task.data.promiseTwo.errorReason}}
            </div>
          {{/if}}
        {{else if task.isError}}
          <div data-test-async-error>
            Error message...
          </div>
        {{/if}}
      </Suspense>
    `);
    assert.dom(loadingSelector).exists('loading is rendered');
    this.deferredOne.resolve({
      name: 'Harry Potter'
    });
    this.deferredTwo.reject('Unable to load');
    await waitUntil(() => !find(loadingSelector));
    assert
      .dom(loadingSelector)
      .doesNotExist('Expected loading to not be rendered');
    assert.dom(dataSelectorTwo).doesNotExist('Expected second success to not be rendered');
    assert
      .dom(dataSelectorOne)
      .hasText('Harry Potter', 'success section is rendered for first promise');
      assert
      .dom(dataErrorSelectorTwo)
      .hasText('Unable to load', 'error section is rendered for second promise');
  });
});