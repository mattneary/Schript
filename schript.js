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
	var variable = "[A-Za-z0-9_$]+",
		block = "\{|\}",
		call = "("+variable+")\\(("+variable+")?((, "+variable+")*?)\\)";
	x = x.replace(/^\s+/, '');
	if( x.match(leading(call)) ) {
		var parts = x.match(leading(call)),
			fn = parts[1],
			args = ((parts[2]||'')+(parts[3]||'')).split(/,\s?/),
			rest = parse(x.substr(parts[0].length));
		return [fn].concat(args).concat(rest);
	} else if( x.match(leading(block)) && x.match(closing(block)) ) {
		var content = body(x).split(/\n/);
		return [["block"].concat(content.filter(identity).map(function(x){return parse(x).slice(0,2)}))].concat(parse(x.substr(body(x).length+2)));
	} else {
		return [];
	}
};
var eval = function(expr, env) {
	if( typeof expr == 'string' ) {
		return {
			val: env[expr],
			env: env
		};
	} else if( expr[0] == 'function' ) {
		return {
			val: function(x) {
				var dup = {};
				for( var k in env ) {
					dup[k] = env[k];
				}
				dup[expr[1]] = x;
				return eval(expr[2], dup);
			},
			env: env
		};
	} else if( expr[0] == 'block' ) {
		return {
			val: expr.slice(1).reduce(function(a, b) {			
				return eval(b, a.env);
			}, {env:env}),
			env: env
		};
	}
};
fs.readFile(__dirname + '/example.sch', function(err, read) {
	console.log(JSON.stringify(parse(read+"")));
	console.log(eval(parse(read+"")[0], {x:1}));
});