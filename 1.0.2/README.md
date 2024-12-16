## ThuleJS-Scopes

Managing scopes containing functions and classes.

---

ES6/Module styled | functions and classes distribution throughout your application.


> **The why is power:**  
> I needed a place for my tools. If it's more than a tool, it should be a module.
>     
> *--with love, quirks and glitches, Idiosyncratics*

</br>

**Get thulejs-scopes**
         
```
npm install thulejs-scopes
```

**See example**  
*Example included in the repository.*

</br>

**Usage**  
*Add an scopes directory to your project root and place here .js or .mjs files.  
The directory structure will be identical to scopes structure.*


*Import the module and add the config:*

```
import scopes from 'thulejs-scopes';
new scopes();
```


*That's it!, your scopes content is now available.*  
<br/>

### Get, Find, Build commands

**Get commands to view your scopes meta.**  
*returns an information object*
```
// returns the name/version/settings of scopes:
scopes.getMeta();

// returns an warning if scope is not loaded

// get the scope meta:
scopes.getMeta('std')

// Get meta in <parent> from <scope>
scopes.getMeta('customScript', 'xml'))          
```


**Find commands to retrieve scopes from cache.**  
*returns an scope object*  
*Provides a safe way to retrieve the scopes.*
```
// must have scopename, returns a warning
scopes.findScopes()                       

// returns an warning if scope is not loaded

// get the first found scope in the structure
scopes.findScopes('xml')                  

// if a double name exists in the scope and you want to specify:
// from <parent> get <scopename>

scopes.findScopes('myModule', 'xml')    
```

**Get commands to return scopes content.**  
*returns an scope object*  
*Will pull from file if not preload or cached (new object)*
```
// returns the entire scopes content:
// by default preload is disabled, a warning is returned.
scopes.getScopes()

// get the first found scope in the structure:
scopes.getScopes('std')

// get these two scopes, first found:
scopes.getScopes('std', 'utils')

// in this example 'utils' will contain mulitple scopes
```

**Build commands to rebuild and cache scopes.**  
*returns a message*  
*Will pull from file if not preload or cached. Scope is then cached*

```
// rebuild the entire scope if preload
scopes.buildScopes()        
                        
// must have scopename, a warning is returned
scopes.buildScopes('std')

// rebuild scope from file, specify from <parent> get <scopename>                           
scopes.buildScopes('customScript', 'xml')           
```



 **Pre-loading scopes:**  
  
*By default the preload is disabled.  
If you use preload, all scopes are loaded at start, responses after are better as imports are already done.  
<br/> 
Use the build commands to build and cache scopes. getScope() will use cached items if available.  
<br/>
So if you care more about speed or memory consumption, this offers some flexibility.*

---

<br/>

### Options and settings
 

Set ThuleJS-scopes options:

*Pass an options object:*

```
new scopes();

// -or-

const scopesOptions ={
    path: '',
    dir: '',
    preload: true
}
new scopes(scopesOptions);
```
*By default if no scopes path and/or dir is given, it will look for 'scopes' in the app root directory.  
In previous versions a scopes directory was created if not present, however this practice is discontinued and an error is thrown instead.
<br/>*

### Scope usage example
*Also see the examples in the repository.  
Functions, classes and arrow functions must be closed with //|| or #checked.  
For functions #function, for classes #class and for arrow functions #arrow*


```
function myFunction (...args){

}//#checked


function myFunction (..args){

}//||

function myFunction (...args){

}//#function

class myClass {

}//#class


const square = x => x * x //||

const function = (test) => { console.log("An arrow function."); }//#checked

const add = (a, b) => a + b //#arrow
```
*The functions are parsed through an AST (abstract syntax tree) to validate the function by [Acorn](https://github.com/acornjs/acorn).  
Invalid functions are skipped.*

### Scope file repository
*The only thing parsed are .js and .mjs, however all files will have their filepaths stored in the scopes.*