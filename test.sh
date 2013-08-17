node schript.js defines.sch | \
	./assert.sh 6 "defines"
node schript.js nested_fns.sch | \
	./assert.sh 5 "nested"
node schript.js io.sch | \
	./assert.sh 1 "I/O"	
node schript.js conds.sch | \
	./assert.sh 5 "conditionals"	
node schript.js recursion.sch | \
	./assert.sh 24 "recursion"			