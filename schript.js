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
		if( read == '{' ) nested++;
		else if( read == '}' ) {
			nested--;
			if( nested == 0 ) {
				return accum;
			}
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
var singleton = function(x) {return [x];};
var parse = function(x) {
	var variable = "[A-Za-z0-9_$+\-\/*]+",
		block = "\{|\}",
		call = "("+variable+")\\(("+variable+")?((, "+variable+")*?)\\)";
	x = x.replace(/^\s+/, '');
	if( x.match(leading(call)) ) {
		var parts = x.match(leading(call)),
			fn = parts[1],
			args = ((parts[2]||'')+(parts[3]||'')).split(/,\s?/),
			rest = parse(x.substr(parts[0].length));			
		if( rest.length ) {
			if( rest[0][0] == 'block' ) {
				return [[fn].concat([args]).concat([rest[0]]),
			            rest.slice(1)];
			} else {
				return ['block', [[fn].concat([args])].concat(group(rest))];
			}
		} else {
			return [fn].concat([args]);
		}
	} else if( x.match(leading(block)) && x.match(closing(block)) ) {
		var content = body(x).split(/\n/);
		return [["block"].concat([content.filter(identity).map(function(x){return parse(x)})])].concat(parse(x.substr(body(x).length+2)));
	} else {
		return [];
	}
};
var eval = function(expr, env) {
	if( typeof expr == 'string' ) {
		return {
			val: expr.match(/^[0-9]+$/) ? parseInt(expr) : env[expr],
			env: env
		};
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
	} else if( expr[0] == 'define' ) {	
		env[expr[1][0]] = eval(expr[1][1], env).val;
		return {
			val: env[expr[1]],
			env: env
		};
	}  else if( expr[0] == 'block' ) {
		return evalseq(expr[1], {env:env});
	} else {
		return {
			val: env[expr[0]].apply({}, expr[1].map(function(x){ return eval(x,env).val; })),
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
fs.readFile(__dirname + '/example.sch', function(err, read) {
	var prelude = {
		"+": function(a,b) {
			return a+b;
		}, "*": function(a,b) {
			return a*b;
		}
	};
	console.log(JSON.stringify(parse(read+"")));
	console.log(evalseq(parse(read+""), {env:prelude}).val);
});