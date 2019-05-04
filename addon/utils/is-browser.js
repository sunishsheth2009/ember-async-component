/**
 * Constant to represent if the app is running on the browser. Uses the "appEnvironment" property
 * injected by BPR.
 *
 * @constant IS_BROWSER
 * @public
 */
const IS_BROWSER = typeof window !== 'undefined' && window && window.appEnvironment !== 'node';

export default IS_BROWSER;
