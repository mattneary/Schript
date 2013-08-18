Schript
=======
Schript will be a JavaScript dialect made more homiconic, like Scheme. This will allow for user-defined macros to be easily done; this is the primary motivation of the project.

Status
------
This language is *very* far from stable, but was sufficiently implemented as an example of macros in a JavaScript-like language.

Syntax
------
###Definitions

```javascript
defun(fact, n) {
	if(n) {
		*(n,fact(n-1))
	} {
		return(1)
	}
}
```

```javascript
define(x, 5)
```

###Invocation

```javascript
write("Hello, World")
```

###Shorthands

__TODO__:

```ruby
cond(eq(n, 0), { 1 },
     eq(car(n), 0), { 2 },
     true, { 3 })
```

Macros
------
Macros have been implemented to allow syntax definition within programs. The following defines a `let` macro which will serve to define a variable over the scope of a block.

```javascript
defmacro(let, name, val, expr) {
	defun(tmp, `name) {
		return(`expr)
	}
	tmp(`val)
}
let(a, 56) {
	write(a)
}
```

Note the back-tick notation which denotes an expression as a value to be inserted into the returned syntax; all other expressions are evaluated upon invocation of the macro.

Roadmap
-------
- Make blocks more first-class.
- Think about the handling of the environment.
- `set!` function etc.
- bootstrap it.
- compiler.