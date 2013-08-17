Schript
=======
Schript will be a JavaScript dialect made more homiconic, like Scheme. This will allow for user-defined macros to be easily done; this is the primary motivation of the project.

Status
------
Very little progress has been made; mostly, this is just an idea.

Syntax
------
###Invocation
```javascript
write("Hello, World")
```

###Blocks
```javascript
if(true) {
	write("Truuu")
}
```

###Definitions
```javascript
defun(fact, n) {
	if(eq(n,0)) {
		1
	} {
		*(n,fact(n-1))	
	}
}
```

```javascript
define(x, 5)
```

###Shorthands
```ruby
cond(eq(n,0) => 1,
     eq(car(n),0) => 2,
     true => 3)
```

Roadmap
-------
__TODO__: handling of subsequent lines is inconsistent because of block expectations.