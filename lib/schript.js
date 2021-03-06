var fs = require('fs');	
var identity = function(x){return x;};
var leading = function(x) {
	return new RegExp("^"+x);
};
var closing = function(x) {
	return new RegExp(x+"$");
};
var body = function(x) {
	var nested = 0, accum = '';
	for( var i = 0; i < x.length; i++ ) {
		var read = x[i];
		if( read == '{' ) {
			nested++;
			if( nested != 1 ) {
				accum += read;
			}
		} else if( read == '}' ) {
			nested--;
			if( nested == 0 ) {
				return {
					body: accum,
					rest: x.substr(i+1)
				};
			} else {
				accum += read;
			}
		}
		else accum += read;
	}
};
var unquote = function(expr, env) {
	if( !expr.map ) {
		if( expr.match(/^`/) ) return env[expr.substr(1)];
		else return expr;
	} else {
		return expr.map(function(x) {
			return unquote(x, env);
		});
	}
};
var application = function(x) {
	var nested = 0, args = [], accum = '';
	for( var i = 0; i < x.length; i++ ) {
		var read = x[i];
		if( read == '(' ) {
			nested++;
			if( nested != 1 ) {
				accum += read;
			}
		} else if( read == ')' ) {
			nested--;
			if( nested == 0 ) {	
				args.push(accum);			
				return args;
			} else {
				accum += read;
			}
		} else if( read == ',' && nested == 1 ) {
			args.push(accum);
			accum = [];
		} else if( read.match(/\s/) && nested == 1 ) {
			// nothing.
		}
		else accum += read;
	}
};
var group = function(arr) {
	var grouped = [],
		accum = [];
	for( var k in arr ) {
		var item = arr[k];
		if( typeof item == 'string' ) {
			grouped.push(accum);
			accum = [item];
		} else if( item[0] == 'block' ) {
			accum.push(item);
		} else {
			accum.push(item);
		}
	}
	grouped.push(accum);
	return grouped.slice(1);
};
var length = function(x){return x.length};
var singleton = function(x) {return [x];};
var parse = function(x, toplevel) {
	var variable = "[A-Za-z0-9_$+\-\/*`]+",
		block = "\{|\}",
		call = "("+variable+")\\(("+variable+")?((, "+variable+")*?)\\)";
	x = x.replace(/^\s+/, '');
	if( x.match(leading(variable+"\\(")) ) {
		if( x.match(leading(call)) ) {			
			var parts = x.match(leading(call)),
				fn = parts[1],
				args = ((parts[2]||'')+(parts[3]||'')).split(/,\s?/),
				rest = parse(x.substr(parts[0].length));						
			if( rest.length ) {
				// TOOD: allow for arbitrary block count
				if( rest[0][0] == 'block' ) {
					if( rest[1] && rest[1][0] == 'block' ) {
						if( rest.length > 2 ) {
							return [[fn].concat([args]).concat([rest[0], rest[1]]),
					                rest.slice(2)];
					    } else {
					    	return [[fn].concat([args]).concat([rest[0], rest[1]])];
					    }
				    } else {
				    	if( rest.length > 1 ) {
					    	return [[fn].concat([args]).concat([rest[0]]),
					    	        rest.slice(1)];
						} else {
							return [[fn].concat([args]).concat([rest[0]])];
						}
				    }
				} else {
					return ['block', [[fn].concat([args])].concat(group(rest))];
				}
			} else {
				if( toplevel ) {
					return [[fn].concat([args])];
				} else {					
					return [fn].concat([args]);
				}
			}
		} else {
			var args = x.split('(').slice(1).join('('),
				applied = application('('+args);	
			var parsed = [x.split('(')[0], applied.map(function(arg) {
				if( arg.match(leading(variable+"\\(")) ) {
					// TOOD: make a general check for complex forms...
					//       i.e., include blocks, etc.
					return parse(arg);
				} else {
					return arg;
				}
			})];
			return toplevel ? [parsed] : parsed;
		}
	} else if( x.match(leading(block)) && x.match(closing(block)) ) {
		var content = body(x).body;		
		parsed = content.indexOf(';') != -1 ? content.split(';').map(function(x) {
			return parse(x);
		}) : parse(content, true);
		return [["block"].concat([parsed])].concat(parse(body(x).rest));
	} else {
		return [];
	}
};
var eval = function(expr, env, macro) {
	if( expr && expr.map && !expr[1] ) {
		expr = expr[0];
	}
	
	if( typeof expr == 'string' ) {
		return macro ? {
			val: expr, env: env
		} : {
			val: expr.match(/^[0-9]+$/) ? parseInt(expr) : env[expr],
			env: env
		};
	} else if( typeof expr == 'number' ) {
		return {
			val: expr,
			env: env
		};
	} else if( typeof expr == 'function' ) {
		return expr;
	} else if( expr[0] == 'defun' ) {
		var fun = function() {
			var dup = {};
			var args = expr[1].slice(1);
			for(var k in env) {
				dup[k] = env[k];
			}
			for( var k in args ) {
				dup[args[k]] = arguments[k];
			}			
			return eval(expr[2], dup).val;
		};
		env[expr[1][0]] = fun;
		return {
			val: fun,
			env: env
		};
	} else if( expr[0] == 'if' ) {
		return {
			val: eval(expr[1][0], env).val ? eval(expr[2], env).val : eval(expr[3], env).val,
			env: env
		};
	} else if( expr[0] == 'define' ) {	
		env[expr[1][0]] = eval(expr[1][1], env).val;
		return {
			val: env[expr[1]],
			env: env
		};
	} else if( expr[0] == 'defmacro' ) {
		var fun = function() {
			var dup = {};
			var args = expr[1].slice(1);
			for(var k in env) {
				dup[k] = env[k];
			}
			for( var k in args ) {
				dup[args[k]] = arguments[k];
			}
			var rewrite = unquote(expr[2], dup);
			return rewrite;
		};
		env.macros[expr[1][0]] = fun;
		return {
			val: fun,
			env: env
		};
	} else if( expr[0] == 'block' ) {
		var loader = function() { return evalseq(expr[1], {env:env}); };
		return macro ? loader : loader();
	} else if( env.macros[expr[0]] ) {
		if( !expr[1] ) {
			expr = expr[0];
		}
		var args = expr[1].map(function(x){
			return eval(x,env,true).val; 
		}).concat([expr.slice(2)]);
		return {
			val: eval(env.macros[expr[0]].apply({}, args), env).val,
			env: env
		};
	} else {
		if( !env[expr[0]] ) {
			throw "Error: Function undefined."
		}
		return macro ? {
			val: expr, env: env
		} : {
			val: env[expr[0]].apply({}, expr[1].map(function(x){
				return eval(x,env).val; 
			})),
			env: env
		};
	}
};
var evalseq = function(exprs, m) {
	if( !exprs.length ) {
		return m;
	} else {
		return evalseq(exprs.slice(1), eval(exprs[0], m.env))
	}
};
fs.readFile(__dirname + '/' + process.argv[2], function(err, read) {
	var prelude = {
		"+": function(a,b) {
			return a+b;
		}, "-": function(a,b) {
			return a-b;
		}, "*": function(a,b) {
			return a*b;
		}, "return": identity,
		   "write": function(x){
		   	console.log(x); return true;
		}, "eq": function(a,b) {
			return a==b;
		}, "macros": {
			let: function(name, val, expr) {
				return ['block', [['defun', ['tmp', name], expr], ['tmp', [val]]]];
			}
		}
	};
	if(process.argv[3] == 'debug') console.log(JSON.stringify(parse(read+"")));
	console.log(evalseq(parse(read+"", true), {env:prelude}).val);
});