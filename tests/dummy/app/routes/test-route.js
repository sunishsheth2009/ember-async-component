import Route from '@ember/routing/route';

/**
 * Render the custom report page by using the the model from parent route based on the report_type. It will not make any network request in the model hook.
 */
export default Route.extend({
  async model() {
    return {
      promiseTrue: Promise.resolve(true)
    };
  },

  setupController(controller) {
    this._super(...arguments);

    if (!controller.get('actions')) controller.set('actions', {});
    controller.set('actions.refresh', this.get('reRun').bind(this));
  },

  reRun() {
    this.refresh();
  }
});
