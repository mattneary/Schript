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
		return [fn].concat([args]).concat(rest);
	} else if( x.match(leading(block)) && x.match(closing(block)) ) {
		var content = body(x).split(/\n/);
		return [["block"].concat(content.filter(identity).map(function(x){return parse(x)}))].concat(parse(x.substr(body(x).length+2)));
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
		return {
			val: function() {
				var dup = {};
				var args = expr[1].slice(1);
				for(var k in env) {
					dup[k] = env[k];
				}
				for( var k in args ) {
					dup[args[k]] = arguments[k];
				}
				return eval(expr[2], dup)
			},
			env: env
		};
	} else if( expr[0] == 'block' ) {
		return {
			val: eval(expr[1], env),
			env: env
		};
	} else {
		return env[expr[0]].apply({}, expr[1].map(function(x){return eval(x,env).val;}));
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
	console.log(eval(parse(read+""), prelude).val(2).val);
});