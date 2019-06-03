import Component from '@ember/component';
import { later } from '@ember/runloop';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { debounce } from '@ember/runloop';

export default Component.extend({
  errorComponent: false,

  promise: computed('errorComponent', function() {
    let promise;

    if (this.get('errorComponent')) {
      promise = {
        errorRequest: this.getError(),
        eventsRequest: this.getEvents()
      };
    } else {
      promise = {
        userRequest: this.getUser()
      };
    }

    return RSVP.hash(promise);
  }).readOnly(),

  getUser(name = 'Iron Man') {
    return new Promise((resolve) => {
      later(
        this,
        () => {
          resolve({
            name,
            time: Date.now()
          });
        },
        1000
      );
    });
  },

  getEvents() {
    return new Promise((resolve, reject) => {
      later(
        this,
        () => {
          reject('Events not found');
        },
        2000
      );
    }).catch((e) => {
      this.set('errorMessage', e);

      throw e;
    });
  },

  getError() {
    return new Promise((resolve, reject) => {
      later(
        this,
        () => {
          reject('Uh oh, this promise was rejected');
        },
        2500
      );
    });
  },

  actions: {
    refreshModel() {
      debounce(this, 'notifyPropertyChange', 'promise', 200);
    },

    propChangeReRender() {
      this.set('errorComponent', !this.get('errorComponent'));
    }
  }
});
