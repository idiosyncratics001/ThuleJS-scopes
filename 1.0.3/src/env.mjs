/**
*   --[ ThuleJS-env | managing environment variables and distribution ]--
*	Author: Raymon van Dolder 
*/
 
import * as module from 'module'
import * as fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = __dirname + '/package.json';
const packageJsonData = fs.readFileSync(packageJsonPath, 'utf8');
const packageJson = JSON.parse(packageJsonData);

/**
 * handles errors in thulejs-env
 * @param {number} level level of the error
 * @param {string} id name of the process
 * @param {string} msg message
 * @param {any} args arguments used in the process
 * @example
 * logger(50, 'getEnvFromFile', 'file not found: ' + envFile)
 */
function logger(level, id, msg, args){
    // !error ? error = '' : error = ` | ${error}`;
    !args  ? args  = '' : args  = ` | ${args}`;

    const levelTag = {
        '60' : "CRIT", 
        '50' : "ERROR",
        '40' : "WARN",
        '30' : "INFO",
        '20' : "DEBUG",
        '10' : "TRACE"
    }
    
    const errorMessage = `thulejs-env | ${levelTag[level]} | ${id} | ${msg}${args}`;
    
    //change here how you wish to handle errors, warning, info
    if(level >= 50) throw new Error(errorMessage)
    if(level <= 40) console.log(errorMessage);
}
/**
 * retrieves content from file and processes it into a key:value object
 * @param {string} envFile filepath
 * @returns {object} env
 */
function getEnvFromFile(envFile) {
    if (!fs.existsSync(envFile)){
        logger(50, 'getEnvFromFile', 'file not found: ' + envFile)
        return
    } 
    var data = fs.readFileSync(envFile, 'utf8');
        
    const env = {};
    const regex  = /[\\\/\.\:\,\!\@\#\$\%\^\&\*\(\)\+\-\=\|]/;
    const regexG = /[\\\/\.\:\,\!\@\#\$\%\^\&\*\(\)\+\-\=\|]/g;
    let pointer  = null;
    let keyExists = null;
        
        // assistant function
        function addKey(key){
            pointer = 'addValue';
            key = key.replaceAll(regexG, '');

            if (Object.keys(env).includes(key)){
                logger(40, 'getEnvFromFile', 'key already exists: ' + key);
                return keyExists = true;
            } else {
                return function addValue(value){
                            env[key] = value;
                            pointer = null;
                        }
            }
        }

    //split env file into lines
    const lines = data.split('\n');
    lines.forEach((line) => {
        
        //if line start with special character go to next line
        if (regex.test(line[0]) || !line) return
        //split each line into tokens (space as separator)
        let tokens = line.split(/[\s]/);

        //if line is not 2 tokens (key and value) read next line 
        if (tokens.length < 2){
            logger(40, 'getEnvFromFile', 'incorrect key/value pair ignored: ' + line);
            return
        } else if (tokens.length > 2){
                tokens = [tokens[0], tokens[1]];
                if (!tokens[0] || !tokens[1]){
                logger(40, 'getEnvFromFile' ,'incorrect key/value pair ignored: ' + line)
            }
        }
        
        tokens.forEach((token) => {
            if (!token) return

            // if key already exists reset and read next line
            if (keyExists){
                keyExists = false
                pointer = null
                return
            }
            
            if (!pointer) {
                pointer = addKey(token); //add key
            }else{
                pointer(token); //add value
            }
        })
    });

    return env
}

export class _env {
    static #meta = {}
    static #env = {}
    
    constructor(options = {}) {
        const file = join(options.path || process.cwd(), options.file || '.env');
        
        if (Object.isFrozen(_env)) {
            throw Error('env locked, cannot apply changes to env');
        } else {
            _env.#meta.name     = packageJson.name;
            _env.#meta.version  = packageJson.version;
            _env.#meta.file     = file;
            _env.#meta.active   = new Date;
            _env.#meta.runtime  = process.version;
            _env.#meta.platform = process.platform;
                        
            _env.#env.PATH_ROOT = process.cwd();
            Object.assign(_env.#env, getEnvFromFile(file));

            process.env.NODE_ENV    = options.node_env || _env.#env.NODE_ENV || 'development'
            process.env.NODE_TZ     = options.node_tz || _env.#env.NODE_TZ

            options.strict === true || _env.#env.ENV_STRICT === 'true'
                ? _env.setStrict()
                : _env.#meta.strict = false;
            
            options.processEnv === true || _env.#env.ENV_PROCESS_ENV === 'true'
            ? _env.setProcessEnv()
            : _env.#meta.processEnv = false;
                
            options.intrinsics === true || _env.#env.ENV_INTRINSICS === 'true'
                ? _env.setIntrinsics()
                : _env.#meta.intrinsics = false;
            
            options.global === true || _env.#env.ENV_GLOBAL === 'true'
                ? _env.setGlobal()
                : _env.#meta.global = false;

            options.checkIn === true || _env.#env.ENV_CHECKIN === 'true'
                ? _env.setCheckIn()
                : _env.#meta.checkIn = false;
        }
    }

    /**
     * get the configuration
     * @returns {object} object meta information
     */
    static getMeta(){
        return _env.#meta;
    }

    /**
     * get the env variables or a sinlge
     * @param {string} envKey NAME_OF_KEY
     * @returns {(string | object)} single key or all keys
     */
    static getEnv(envKey){
        if (envKey) {
            if (_env.#env[envKey]) return _env.#env[envKey]
            return 'thulejs-env | WARN | key not found: ' + envKey            
        }
        return _env.#env;
    }
    
    /**
     * set a new key-value pair, double keys are not added.
     * @param {string} key NAME_OF_KEY
     * @param {string} value anything no spaces
     */
    static setEnv(key, value) {
        if (Object.keys(_env.#env).includes(key)) return 'thulejs-env | WARN | key already exists: ' + key
        _env.#env[key] = value
    }

    /**
     * set a new value to a key.
     * @param {string} key NAME_OF_KEY
     * @param {string} value anything no spaces
     */
    static updateEnv(key, value) {
        if (!Object.keys(_env.#env).includes(key)) return 'thulejs-env | WARN | key not found: ' + key  
        _env.#env[key] = value
    }

    /**
     * delete a new key-value pair.
     * @param {string} key NAME_OF_KEY
     */
    static delEnv(key) {
        if (!Object.keys(_env.#env).includes(key)) return 'thulejs-env | WARN | key not found: ' + key  
        delete _env.#env[key]
    }

    /** check-in of your env scope (cannot be checked out). */
    static setCheckIn() {
        if (Object.isFrozen(_env)) return true
        _env.#meta.checkInTime = new Date;
        _env.#meta.checkIn = true;
        Object.freeze(_env);
        Object.freeze(_env.#env);
        Object.freeze(_env.#meta);
    }

    /** set use-strict on all modules. */
    static setStrict(){
        _env.#meta.strict = true;
        if (Object.isFrozen(module.wrap)) return true
        module.Module.wrapper[0] += '"use strict";';
        Object.freeze(module.wrap);
    }

    /** check-in of your process.env scope (cannot be undone). */
    static setProcessEnv() {
        process.env = new Proxy({...process.env}, {
            set: function(obj, prop, value) {
                throw Error('process.env locked, cannot apply changes to process.env')
            }
        });
        _env.#meta.processEnv = true;
    }

    static setIntrinsics() {
    // --[ Experimental ]--
        process.env.NODE_OPTIONS = '--frozen-intrinsics';
        _env.#meta.intrinsics = true;
    }

    static setGlobal() {
    // --[ Experimental ]--
        if (Object.isFrozen(global)) return true;
        Object.freeze(global);
        _env.#meta.global = true;
    }

    static setLockdown() {
        setStrict();
        setProcessEnv();
        setCheckIn();
    }
}

