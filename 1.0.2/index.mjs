/*	
*   --[ ThuleJS-scopes | managing scopes containing functions and classes ]--
*	Author: Raymon van Dolder
*/

import { readFileSync, readdirSync, statSync, existsSync} from 'fs'
import { parse } from 'acorn'
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = __dirname + '/package.json';
const packageJsonData = readFileSync(packageJsonPath, 'utf8');
const packageJson = JSON.parse(packageJsonData);


// helper functions
function errorLogger(level, id, msg, args, error){
    !error ? error = '' : error = ` | ${error}`
    !args  ? args  = '' : args  = ` | ${args}`

    const levelTag = {
        '60' : "CRIT", 
        '50' : "ERROR",
        '40' : "WARN",
        '30' : "INFO",
        '20' : "DEBUG",
        '10' : "TRACE"
    }
    
    const errorMessage = `thulejs-scopes | ${levelTag[level]} | ${id} | ${msg}${args}${error}`;
    
    //change here how you wish to handle errors, warning, info
    if(level >= 50) throw new Error(errorMessage);
    if(level <= 30) console.log(errorMessage);
}

function getFilePaths (dir) {
    const filePaths = {}
    try{
        readdirSync(dir).forEach((file) => {
        var path = join(dir, file);
        var stat = statSync(path);
        var scopeName = file.slice(0, -3);
        
        if (stat.isDirectory()) {
            filePaths[file]= getFilePaths(path);
        } else {
            filePaths[scopeName] = path
        }
    });

    }catch(error){
        errorLogger(40, 'getFilePaths', 'file read error', dir, error);
        return null
    }

    return filePaths;
}

function findSubObj(obj, keyToMatch) {
    if (typeof obj !== 'object') return null // base case: not an object

    if (obj[keyToMatch]) return obj[keyToMatch] // found the matching key

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object') {
        const result = findSubObj(value, keyToMatch); // recursive search in nested object
        if (result !== null) return result 
        }
    }
    return null // not found
}

function findAndReplace(obj, parentKey, keyToMatch, replacement) {
    if (typeof obj !== 'object') return null

    // If parentKey is null or undefined, directly look for keyToMatch
    if (parentKey === null || parentKey === undefined) {
        if (keyToMatch in obj) {
        obj[keyToMatch] = replacement;
        return obj
    }
    } else {
        // If parentKey is not null or undefined, look for it in obj
        if (parentKey in obj) {
            // If parentKey is found, look for keyToMatch in obj
            if (keyToMatch in obj[parentKey]) {
                obj[parentKey][keyToMatch] = replacement;
                return obj
            }
        }
    }
  
    // If keyToMatch is not found, recursively search in nested objects
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object') {
        const result = findAndReplace(value, parentKey, keyToMatch, replacement);
        if (result !== null) return result
      }
    }
  
    return null // not found
  }


// read file and get all functions, classes and arrow functions 
function getFileContent(obj, reloadScopeName) {

    // Regular expression to match function declarations
    const functionRegex = /^\S*(public|private|protected)?\S*function\s*([a-zA-Z_$][\w$]*)\s*\(\s*([a-zA-Z_$].*|\s*|)?\s*\)\s*{\s*([^]*?)}\s*\/\/(\|\||#checked|#function)/gm;
    // Regular expression to match class declarations
    const classRegex = /^\S*(public|private|protected)?\S*class\s*([a-zA-Z_$][\w$]*)\s*{\s*(\s*constructor\s*\([^]*?\)\s*)([^]*?)}\s*\/\/(\|\||#checked|#class)?/gm;
    // Regular expression to match arrow functions
    const arrowFunctionRegex = /^\S*(?:const|let|var)?\s*([a-zA-Z_$][\w$]*)\s*=\s*((?:[a-zA-Z_$][\w$]*|(\(([^]*?)\)))\s*=>\s*([^]*?))\s*\/\/(\|\||#checked|#arrow)/gm
    let match;
    
    //acorn settings
    const parsedAST = (code) => parse(code, {
        ecmaVersion: 11, // adjust to your desired ECMAScript version
        sourceType: 'module', // or 'script' depending on your use case
    });

    // build up the return scope
    function importScope (filePath, scopeName) {

        var data = null;
        
        try {
          var getFile = readFileSync(filePath, 'utf8')
          data = getFile;
        }catch(error){
          errorLogger(40, 'importScope', 'file read error', filePath ,error)
          return filePath + ' file read error' 
        }        
        if (data === '' ) return 'empty scope'
        
        
        const func = {}
        func.path = {}
        func.path = func.path[scopeName] = filePath
        func.active = {}
        func.active = func.active[scopeName] = new Date();
        func.meta = []        
        
        // Find all function matches
        while ((match = functionRegex.exec(data)) !== null) {
            const functionName = match[2];
            var args = match[3];
            args ? args = args.trim() : args = '';

            if (func[functionName]){
                errorLogger(40, 'importScope', 'function ignored, already exists', `${scopeName} > ${functionName}`)
            } else {
                // santize
                const sanitizeCode = JSON.stringify(match[0]);
                const isValid = parsedAST(sanitizeCode) !== null;
                
                if (isValid) {
                func.meta = func.meta.concat({ scope: scopeName, type: 'function', name: functionName, args: args });  // Push the function name
                eval(`func.${functionName} = ${JSON.parse(sanitizeCode)}`);
                } 
            }
        }
    
        // Find all class matches
        while ((match = classRegex.exec(data)) !== null) {
            const className = match[2];
            var args = match[3];
            args ? args = args.trim() : args = ''
          
            if (func[className]){
                errorLogger(40, 'importScope', 'class ignored, already exists', `${scopeName} > ${className}`)
            } else {
            // santize
            const sanitizeCode = JSON.stringify(match[0]);
            const isValid = parsedAST(sanitizeCode) !== null;
            
            if (isValid) {
              func.meta = func.meta.concat({ scope: scopeName, type: 'class', name: className, args: args }); // Push the class name
              eval(`func.${className} = ${JSON.parse(sanitizeCode)}`);
            }
          }
        }
    
        // Find all arrow function matches
        while ((match = arrowFunctionRegex.exec(data)) !== null) {
            const arrowName = match[1];
            var args = match[3];
            args ? args = args.trim() : args = ''

            if (func[arrowName]){
                errorLogger(40, 'importScope', 'arrowFunction ignored, already exists', `${scopeName} > ${arrowName}`);
            } else {
                // santize
                const sanitizeCode = JSON.stringify(match[2]);
                const isValid = parsedAST(sanitizeCode) !== null;
        
                if (isValid){
                func.meta = func.meta.concat({ scope: scopeName, type: 'arrowFunction', name: arrowName, args: args }); // Push the arrow function name
                eval(`func.${arrowName} = ${JSON.parse(sanitizeCode)}`);
                }
            }
        }
        return func    
    }

    // retrace all path nodes in the obj and replace string with functions
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
          getFileContent(obj[key]);
        } else {
            if (obj[key].slice(-2) === 'js' || obj[key].slice(-3) === 'mjs'){
                reloadScopeName
                ? obj[key] = importScope(obj[key], reloadScopeName)
                : obj[key] = importScope(obj[key], key);
            }
        }
    }

    return obj
}

export default class _scopes {
    static #meta = {}
    static #scopes = {}
    
    static #build = (options = {}) => {
        var scopesPath;      
      
        options.reload 
        ? scopesPath = options.path
        : scopesPath = join(options.path || process.cwd(), options.dir || './scopes/');
        
        if (!existsSync(scopesPath)){
            errorLogger(50, 'constructor:build', 'path not found ', scopesPath);
            return 'path not found'
        }
                                        
        const _getFilePaths = getFilePaths(scopesPath)  //built array of files and structure
        options.preload
            ? this.#scopes = getFileContent (_getFilePaths) //convert all files found into functions
            : this.#scopes = _getFilePaths;

        this.#meta.name     = packageJson.name;
        this.#meta.version  = packageJson.version;
        this.#meta.path     = scopesPath;
        this.#meta.active   = new Date();
        this.#meta.preload  = options.preload || false;
    }

    constructor(options) {
        _scopes.#build(options);
    }

    static getMeta(...scopeName){
        if (!scopeName || scopeName.length == 0) return this.#meta
        if (scopeName.length > 2){
            errorLogger(40, 'getMeta', 'incorrect number of arguments ', ...scopeName);
            return 'incorrect number of arguments'
        }
        
        var returnMeta;
        
        if(scopeName.length > 1){
            var findParentScope = findSubObj(this.#scopes, scopeName[0]);
            !findParentScope
                ? findParentScope = null
                : returnMeta = findSubObj(findParentScope, scopeName[1]).meta;
        }
        if(scopeName.length == 1){
            returnMeta = findSubObj(this.#scopes, scopeName).meta;
            if(!returnMeta) returnMeta = null;
        }

        if(!returnMeta){
            errorLogger(40, 'getMeta', 'scope not found', scopeName);
            return 'scope not found'
        }

        return returnMeta
    }


  
    static getScopes(...scopeName){
      if (!scopeName || scopeName.length == 0){
        if(this.#meta.preload) return this.#scopes
        errorLogger(40, 'getScopes', 'scopes not preloaded');
        return 'scopes not preloaded'
      }

      var returnScope;
      
      if(scopeName.length > 1){
        returnScope = {}

        scopeName.forEach((name)=>{
            returnScope[name]= findSubObj(this.#scopes, name);
            if(!returnScope[name]){
                errorLogger(40, 'getScopes', 'scope not found' , name);
                returnScope[name] = 'scope not found';
            }
        })

        if (this.#meta.preload){
          return returnScope
        }
        
        // if not preload get the content
        for (const key in returnScope) {
            if(key.cached) return
            const content = returnScope[key];
            const obj = getFileContent({content}, key);
            returnScope[key] = obj.content;
        }

        return returnScope
      }


        if(scopeName.length == 1){
        returnScope = findSubObj(this.#scopes, scopeName[0]);
            if(!returnScope){
                errorLogger(40, 'getScopes', 'scope not found' , scopeName);
                return 'scope not found'
            }

        if (this.#meta.preload || returnScope.cached){
            return returnScope
        }

        if(existsSync(returnScope)) returnScope = getFileContent({returnScope},scopeName[0]).returnScope;
        if(!returnScope){
            errorLogger(40, 'getScopes', 'file not found' ,returnScope);
            returnScope = 'file not found'
        }
        
        return returnScope
        }
    }
    
    static findScopes(...scopeName){
        if (!scopeName || scopeName.length == 0){
          errorLogger(40, 'findScopes', 'incorrect number of arguments ', ...scopeName)
          return 'incorrect number of arguments'
        }
        
        var returnScope;
        
        if(scopeName.length > 1){
          var findParentScope = findSubObj(this.#scopes, scopeName[0]);
          !findParentScope
            ? returnScope = null
            : returnScope = findSubObj(findParentScope, scopeName[1]);
        }
        if(scopeName.length == 1){
            returnScope = findSubObj(this.#scopes, scopeName);
        }
  
        if(!returnScope){
            errorLogger(40, 'findScopes', 'scope not found', scopeName);
            return 'scope not found'
        }

        if(typeof returnScope === 'string'){
            return 'scope not active'
        }

        return returnScope
    }

    static buildScopes(...scopeName){
        if (!scopeName || scopeName.length == 0) {
            if (!this.#meta.preload){
                errorLogger(40, 'buildScopes', 'scopes not preloaded');
                return 'scopes not preloaded'
            }
            
            this.#meta.reload = true;
            this.#meta.reloadTime = new Date();

            this.#build(this.#meta); //if no scope is specified, rebuild all scopes

            errorLogger(30, 'buildScopes', 'all scopes reloaded');
            return 'all scopes reloaded'
        }

        // only scopename given, first found will be replaced
        if (scopeName.length == 1){
            var childNode = scopeName[0];
            var scopePath = findSubObj(this.#scopes, childNode);
            if(!scopePath){
                errorLogger(40, 'buildScopes', 'scope not found', childNode);
                return 'scope not found' + childNode
            }
 
            if (this.#meta.preload || scopePath.cached ||  typeof scopePath.path !== 'undefined'){   
                scopePath = scopePath.path;
            }
         
            if(existsSync(scopePath)){
                var replacement = getFileContent({scopePath}, childNode).scopePath
                replacement.cached = true;
                findAndReplace(this.#scopes, null, childNode, replacement)
            }else{
                errorLogger(40, 'buildScopes', 'file not found', scopePath);
                return 'file not found' + scopePath
            }

            errorLogger(30, 'buildScopes', childNode + " reloaded");
            return `${childNode} reloaded`
        }
        if(scopeName.length > 2){
            errorLogger(40, 'buildScopes', 'incorrect number of arguments', scopeName);
            return 'incorrect number of arguments' + scopeName
        }
        
        // parent and scopename are given, find the scope in parent and replace
        var parentNode = scopeName[0];
        var childNode = scopeName[1];
        var scopePath;

        var findParentScope = findSubObj(this.#scopes, parentNode);
        if(findParentScope) scopePath = findSubObj(findParentScope, childNode);
        if(!findParentScope || !scopePath){
            errorLogger(40, 'buildScopes', 'scope not found', childNode + ' not found in ' + parentNode);
            return 'scope ' + childNode + ' not found in ' + parentNode 
        }

        if (this.#meta.preload || scopePath.cached || typeof scopePath.path !== 'undefined'){   
            scopePath = scopePath.path;
        }

        if(existsSync(scopePath)){
            var replacement = getFileContent({scopePath}, childNode).scopePath;
            replacement.cached = true;
            findAndReplace(this.#scopes, parentNode, childNode, replacement);
            errorLogger(30, 'buildScopes', `${childNode} in ${parentNode} reloaded`);
            return `${childNode} in ${parentNode} reloaded`
        }
    }
}