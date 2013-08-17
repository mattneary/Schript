node lib/schript.js ../tests/defines.sch | \
	tests/assert.sh 6 "defines"
node lib/schript.js ../tests/nested_fns.sch | \
	tests/assert.sh 5 "nested"
node lib/schript.js ../tests/io.sch | \
	tests/assert.sh 1 "I/O"	
node lib/schript.js ../tests/conds.sch | \
	tests/assert.sh 5 "conditionals"	
node lib/schript.js ../tests/recursion.sch | \
	tests/assert.sh 24 "recursion"			
node lib/schript.js ../tests/macros.sch | \
	tests/assert.sh 56 "internal macros"				