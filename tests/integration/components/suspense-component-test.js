import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { defer as Defer } from 'rsvp';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | suspense-component', function (hooks) {
  setupRenderingTest(hooks);

  test('Component renders in success case as expected', async function (assert) {
    const loadingSelector = '[data-test-async-loading]';
    const errorSelector = '[data-test-async-error]';
    const dataSelector = '[data-test-async-success]';

    this.deferred = new Defer();
    this.deferredPromise = this.deferred.promise;

    await render(hbs`
      <Suspense
        @promise={{deferredPromise}}
        as |task|
      >
        {{#if task.isLoading}}
          <div data-test-async-loading>
            Loading...
          </div>
        {{else if task.isSuccess}}
          <div data-test-async-success>
            {{task.data.name}}
          </div>
        {{else if task.isError}}
          <div data-test-async-error>
            Error message...
          </div>
        {{/if}}
      </Suspense>
    `);

    assert.dom(loadingSelector).exists('loading is rendered');

    this.deferred.resolve({
      name: 'Harry Potter'
    });
    await waitUntil(() => !find(loadingSelector));

    assert
      .dom(loadingSelector)
      .doesNotExist('Expected loading to not be rendered');
    assert.dom(errorSelector).doesNotExist('Expected error to not be rendered');
    assert
      .dom(dataSelector)
      .hasText('Harry Potter', 'success section is rendered');
  });

  test('Component renders in success case if input is an object', async function (assert) {
    const loadingSelector = '[data-test-async-loading]';
    const errorSelector = '[data-test-async-error]';
    const dataSelector = '[data-test-async-success]';

    this.regularObject = {
      name: 'Harry Potter'
    };

    await render(hbs`
      <Suspense
        @promise={{regularObject}}
        as |task|
      >
        {{#if task.isLoading}}
          <div data-test-async-loading>
            Loading...
          </div>
        {{else if task.isSuccess}}
          <div data-test-async-success>
            {{task.data.name}}
          </div>
        {{else if task.isError}}
          <div data-test-async-error>
            Error message...
          </div>
        {{/if}}
      </Suspense>
    `);

    assert.dom(loadingSelector)
    .doesNotExist('Expected loading to not be rendered');

    await waitUntil(() => !find(loadingSelector));

    assert
      .dom(loadingSelector)
      .doesNotExist('Expected loading to not be rendered');
    assert.dom(errorSelector).doesNotExist('Expected error to not be rendered');
    assert
      .dom(dataSelector)
      .hasText('Harry Potter', 'success section is rendered');
  });

  test('Component renders in error case as expected', async function (assert) {
    const loadingSelector = '[data-test-async-loading]';
    const errorSelector = '[data-test-async-error]';
    const dataSelector = '[data-test-async-success]';

    this.deferred = new Defer();
    this.deferredPromise = () => this.deferred.promise;

    this.deferred.promise.catch((e) => {
      this.errorMessage = e;
    });

    await render(hbs`
      <Suspense
        @promise={{deferredPromise}}
        as |task|
      >
        {{#if task.isLoading}}
          <div data-test-async-loading>
            Loading...
          </div>
        {{else if task.isSuccess}}
          <div data-test-async-success>
            {{task.data.name}}
          </div>
        {{else if task.isError}}
          <div data-test-async-error>
            Error message...
          </div>
        {{/if}}
      </Suspense>
    `);

    assert.dom(loadingSelector).exists('loading is rendered');

    this.deferred.reject('Error...');
    await waitUntil(() => !find(loadingSelector));

    assert
      .dom(loadingSelector)
      .doesNotExist('Expected loading to not be rendered');
    assert
      .dom(errorSelector)
      .hasText('Error message...', 'error section is rendered');
    assert
      .dom(dataSelector)
      .doesNotExist('Expected success section not be rendered');
  });

  test('Component renders in success case as expected in the fastboot case', async function (assert) {
    const loadingSelector = '[data-test-async-loading]';
    const errorSelector = '[data-test-async-error]';
    const dataSelector = '[data-test-async-success]';

    this.deferred = new Defer();
    this.deferredPromise = this.deferred.promise;

    this.sandbox = sinon.createSandbox();
    this.deferRendering = this.sandbox.stub();
    const fastbootStub = Service.extend({
      isFastBoot: true,
      deferRendering: this.deferRendering
    });

    this.owner.register('service:fastboot', fastbootStub);

    await render(hbs`
      <Suspense
        @promise={{deferredPromise}}
        @blockRender={{true}}
        as |task|
      >
        {{#if task.isLoading}}
          <div data-test-async-loading>
            Loading...
          </div>
        {{else if task.isSuccess}}
          <div data-test-async-success>
            {{task.data.name}}
          </div>
        {{else if task.isError}}
          <div data-test-async-error>
            Error message...
          </div>
        {{/if}}
      </Suspense>
    `);

    assert.dom(loadingSelector).exists('loading is rendered');

    this.deferred.resolve({
      name: 'Harry Potter'
    });
    await waitUntil(() => !find(loadingSelector));

    assert
      .dom(loadingSelector)
      .doesNotExist('Expected loading to not be rendered');
    assert.dom(errorSelector).doesNotExist('Expected error to not be rendered');
    assert
      .dom(dataSelector)
      .hasText('Harry Potter', 'success section is rendered');
    assert.ok(
      this.deferRendering.calledWith(this.deferredPromise),
      'fastboot service was called correctly'
    );
  });
});
