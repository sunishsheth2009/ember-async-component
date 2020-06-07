import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {later} from '@ember/runloop';
import {action} from '@ember/object';
import RSVP from 'rsvp';

export default class AsynComponentContainer extends Component {
  @tracked errorComponent = false;
  @tracked user = 'Iron Man';

  get promise() {
    let promise;

    if (this.errorComponent) {
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
  }

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
      this.errorMessage = e;

      throw e;
    });
  }

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
  }

  @action
  getUser(name) {
    const superHero = name || this.user;

    return new Promise((resolve) => {
      later(
        this,
        () => {
          resolve({
            name: superHero,
            time: Date.now()
          });
        },
        1000
      );
    });
  }

  @action
  refreshModel() {
    this.user = 'Super Man';
  }

  @action
  propChangeReRender() {
    this.errorComponent = !this.errorComponent;
  }
}
