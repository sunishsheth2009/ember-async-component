import { helper } from "@ember/component/helper";

/**
 * Calls an arbitrary function from the template with arguments passed through
 *
 * @export
 * @param {Function} func - the function to call
 * @param {Array} ...arr - all other params bundled together
 * @returns {any} - return value from func
 */

export function funcApply([func, ...arr]) {
  return func(...arr);
}

export default helper(funcApply);
