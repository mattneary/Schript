Schript
=======
Schript will be a JavaScript dialect made more homiconic, like Scheme. This will allow for user-defined macros to be easily done; this is the primary motivation of the project.

Status
------
Parsing works for the most part. The next task will be to make blocks more first-class.

Syntax
------
###Invocation

__Passing__:

```javascript
write("Hello, World")
```

###Blocks

__Passing__:

```javascript
if(true) {
	write("Truuu")
} {
	return(0)
}
```

###Definitions

__Passing__:

```javascript
defun(fact, n) {
	if(eq(n,0)) {
		return(1)
	} {
		*(n,fact(n-1))	
	}
}
```

__Passing__:

```javascript
define(x, 5)
```

###Shorthands
```ruby
cond(eq(n, 0), { 1 },
     eq(car(n), 0), { 2 },
     true, { 3 })
```

Roadmap
-------
- Make blocks more first-class.
- Think about the handling of the environment.