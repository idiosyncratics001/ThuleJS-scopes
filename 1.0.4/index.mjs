/**
 * @module ThuleJS-scopes
 * @author Raymon van Dolder
 * @version 1.0.4
 * @description <b>Managing scopes containing functions and classes.</b> </br>
 * @example
 * // The scopes structure will be the same as directory/file structure.
 * // example file structure:
 * ./scopes
 * |-std.js
 * |-utils
 *      |-file
 *          |-copyFile.js
 * 
 * import scopes from 'thulejs-scopes';
 * 
 * scopes.init()
 * 
 * // -or-
 * 
 * const scopesOptions ={
 *   path: '',
 *   dir: '',
 *   preload: true
 * }
 * 
 *scopes.init(scopesOptions);
 */

import * as scopes from './src/scopes.mjs'

export default{
    /**
     * @description By default if no scopes path and/or dir is given, it will look for 'scopes' in the app root directory. </br>
     * In previous versions a scopes directory was created if not present, however this practice is discontinued and an error is thrown instead. </br></br>
     * <b>Pre-loading scopes:</b> </br>
     * By default the preload is disabled. </br>
     * If you use preload, all scopes are loaded at start, responses after are better as imports are already done. </br>
     * Use the build commands to build and cache scopes. getScope() will use cached items if available. </br>
     * So if you care more about speed or memory consumption, this offers some flexibility. </br>
     * 
     * @param {object}  options options object
     * @param {string}  options.path path of the scopes directory if not app root
     * @param {string}  options.dir directory name if not 'scopes'
     * @param {boolean} options.preload load all the scopes in scopes directory on start.
     */
    init(options){
        var init = new scopes._scopes(options);
        return init
    },

    /**
     * @description returns the name/version/settings of ThuleJS-scopes -or-  meta of a scope
     * @param {...args} arguments nul -or- scopename -or- parent and scopename
     * @param {null} arguments.null no arguments, returns the name/version/settings of ThuleJS-scopes.
     * @param {string} arguments.scopename only scopename, returns the meta of the first found scope in the structure.
     * @param {string} arguments.parent parent and scopename, returns the meta of the first found scope in the parent node.
     * @returns {object} information object
     * @example
     * scopes.getMeta();
     * // returns:
     * name: 'ThuleJS-scopes',
     * {
     *  version: '1.0.3',
     *  path: '/idiosyncratics/scopes/',
     *  active: 2025-01-04T17:01:02.648Z,
     *  preload: true
     * }
     * 
     * scopes.getMeta('std')
     * // returns:
     * {
     *  { scope: 'std', type: 'function', name: 'getDateTime', args: '' },
     *  { scope: 'std', type: 'function', name: 'isFunction', args: 'thing' },
     *  { scope: 'std', type: 'function', name: 'isClass', args: 'variable' },
     * 
     * scopes.getMeta('file', 'copyFile'))
     *  {
     *    scope: 'file',
     *    type: 'function',
     *    name: 'copyFile',
     *    args: 'source, target, cb'
     *  } 
     */
    getMeta(...args){
        return scopes._scopes.getMeta(...args);
    },

    /**
     * @description Returns the entire scope -or- scope in scope object </br>
     * Returns 'scope not active' if scope is not loaded. </br>
     * See getScopes() to load and cache scopes on demand. </br>
     * @param {...args} scopename
     * @param {null} scopename.null returns entire scope if pre-loaded or 'scopes not (p)reload'
     * @param {string} scopename.scopename returns the first found scopename -or- scopenames in the structure
     * @param {array} scopename.parent [parent, scopename] returns the first found scopename in the parent
     * @returns {object} object with functions
     * @example
     * scopes.findScope()
     * scopes.findScope('std', 'file') 
     * scopes.findScope('std', 'file', ['utils','xml'])
     */
    findScopes(...args){
        return scopes._scopes.findScopes(...args);
    },

    /**
     * @description Returns the entire scope -or- scope in scope object </br>
     * If the scope is not loaded, it will do so on demand and cache the scope.
     * @param {...args} scopename null returns 'incorrect number of arguments'
     * @param {string} scopename.scopename only scopename, returns the first found scope in the structure
     * @param {string} scopename.parent parent and scopename, returns the first found scope in the parent node
     * @returns {object} object with functions
     * @example
     * scopes.getScopes()
     * scopes.getScopes('std') 
     * scopes.getScopes('utils','xml')
     */
    getScopes(...args){
        return scopes._scopes.getScopes(...args);
    },

    /**
     * @description Rebuild the entire scope -or- scope </br>
     * If a scope is altered and must be rebuild on demand.
     * @param {...args} scopename
     * @param {null} scopename.null rebuild the entire scope --[ use with caution ]--
     * @param {string} scopename.scopename only scopename, rebuild the first found scope in the structure.
     * @param {string} scopename.parent parent and scopename, rebuild the first found scope in the parent node.
     * @returns {string} message of result
     */
    buildScopes(...args){
        return scopes._scopes.buildScopes(...args);
    }
}