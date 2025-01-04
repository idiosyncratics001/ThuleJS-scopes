Managing environment variables and distribution.

---

ES6/Module styled, vanilla JavaScript .env settings and distribution.  
Engine: Node.js


> **The why is power:**  
> The first in a series of modules. Something profound here..
>     
> *--with love, quirks and glitches, Idiosyncratics*



**Get thulejs-env**
         
```
npm install thulejs-env
```

**Consult the documentation**  
*Docs can be found in the Git repository.*


**Usage**  
*Add an .env file to your project root and define key and value pairs.
These are space separated.*

```
ENV_KEY: this_is_value
```


*Import the module and add the config:*

```
import env from 'thulejs-env';
env.init();
```


*That's it!, your .env content is now available.*


**Get commands to view your env.**
```
// get the configuration/
env.getMeta();

// get the env variables.
env.getEnv();
```

**settings default**  
*By default the are variables are not checked in, meaning they can be altered or new pairs added.  
Set the options as shown below to prevent this.

Note: This may break other modules if you freeze their assets.

---

### Options and settings
 
```
const envOptions = {
  file: '.env',
  path: __dirname,
  strict: true,
  node_env: 'development',
  checkIn: true,
  processEnv: true,
  global: false,
  intrinsics: false
} 
env.init(envOptions);

// get the configuration
env.getMeta();

// get the env variables.
_env = env.getEnv();

var timezone = _env.NODE_TZ

// -or-

var timezone = env.getEnv('NODE_TZ')
```

**strict**: use-strict on all modules  
**checkIn**: check-in of your env scope (cannot be checked out). Attempts to alter the env will return an error.  
**processEnv**: check-in of your process.env scope (cannot be checked out).  
**global**:  check-in of your global scope (cannot be checked out).

**intrinsics**: "--frozen-intrinsics": 
JavaScript objects and functions are recursively frozen, except for globalThis.
[Experimental] which means node team may take it out again.


*Alternatively you can call options separately on a time of your choosing:*

```
setEnv(key, value)
delEnv(key)
setCheckIn()
setStrict()
setProcessEnv()
setIntrinsics()
setGlobal()
setLockdown()
```

***It's all thanks to you!***

*To all the patient people on forums and contributors helping curious and creative people solve their problems, one at a time, Thank you.*

