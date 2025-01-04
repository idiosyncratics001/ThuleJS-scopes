/**
 * @module ThuleJS-env
 * @author Raymon van Dolder
 * @version 1.0.3
 * @description Managing environment variables and distribution. </br> ThuleJS-env is a class object cached by Node.js module cache
 * @example
 * import env from 'thulejs-env';
 * 
 * const envOptions = {
 *   file: '.env',
 *   path: __dirname,
 *   strict: true,
 *   node_env: 'development',
 *   checkIn: true,
 *   processEnv: true,
 *   global: false,
 *   intrinsics: false
 * }
 * env.init(envOptions);
 * 
 * // get the configuration
 * env.getMeta();
 * 
 * // get the env variables.
 * _env = env.getEnv();
 * 
 * var timezone = _env.NODE_TZ
 * 
 * // -or-
 * 
 * var timezone = env.getEnv('NODE_TZ')
 */

import * as env from './src/env.mjs'

export default{
    /**
     * @param {object}  options options object
     * @param {string}  options.path path of the .env file if not root
     * @param {string}  options.file filename if not .env
     * @param {boolean} options.strict use-strict on all modules
     * @param {string}  options.node_env development | production
     * @param {boolean} options.checkIn  check-in of your env scope (cannot be checked out). Attempts to alter the env will return an error.
     * @param {boolean} options.processEnv check-in of your process.env scope (cannot be checked out).
     * @param {boolean} options.global check-in of your global scope (cannot be checked out).
     * @param {boolean} options.intrinsics "--frozen-intrinsics": JavaScript objects and functions are recursively frozen, except for globalThis. [Experimental] which means node team may take it out again.
     */
    init(options){
        var init = new env._env(options);
        return init
    },

    /**
     * @description get the configuration
     * @returns {object} object meta information
     * @example
     * {
     *  name: 'thulejs-env',
     *  version: '1.0.3',
     *  file: '/idiosyncratics/.env',
     *  active: 2025-01-02T21:55:48.107Z,
     *  runtime: 'v23.5.0',
     *  strict: true,
     *  processEnv: true,
     *  global: false,
     *  intrinsics: false,
     *  checkInTime: 2025-01-02T21:55:48.111Z,
     *  checkIn: true
     */
    getMeta(){
        return env._env.getMeta()
    },

    /**
     * @description get the env variables or a sinlge
     * @param {string} envKey NAME_OF_KEY
     * @returns {(string | object)} single key or all keys
     * @example
     * var env = env.getEnv();
     * var timezone = env.getEnv('NODE_TZ')
     */
    getEnv(envKey){
        return env._env.getEnv()
    },

    /**
     * @description set a new key-value pair, double keys are not added.
     * @param {string} key NAME_OF_KEY
     * @param {string} value anything no spaces
     */
    setEnv(key, value) {
        return env._env.setEnv(key,value);
    },

    /**
     * @description set a new value to a key.
     * @param {string} key NAME_OF_KEY
     * @param {string} value anything no spaces
     */
    updateEnv(key, value) {
        return env._env.setEnv(key, value);
    },

    /**
     * @description delete a new key-value pair.
     * @param {string} key NAME_OF_KEY
     */
    delEnv(key) {
        return env._env.setEnv(key);
    },

    /** 
     * @description check-in of your env scope. </br>
     */
    setCheckIn() {
        return env._env.setCheckIn()
    },

    /** 
     * @description set use-strict on all modules. </br>
     * --[ Thank you Isaacs! ]--
     * website: https://www.npmjs.com/package/use-strict
    */
    setStrict(){
        return env._env.setStrict();
    },

    /** 
     * @description check-in of your process.env scope (cannot be undone). </br>
     * --[ Thank you vorticalbox! ]-- 
     * website: https://github.com/vorticalbox
     */
    setProcessEnv() {
        return env._env.setProcessEnv();
    },

    /** 
     * @description If node is not started with this as an argument it can still be applied to worker & child-processes. </br>
     * --[ experimental ]--
     */
    setIntrinsics(){
        return env._env.setIntrinsics();
    },

    /** @description check-in of your global scope. */
    setGlobal() {
        return env._env.setGlobal();
    },

    /** @description set strict, check-in env and check-in processEnv with one command. */
    setLockdown() {
        return env._env.setGlobal();
    }
}