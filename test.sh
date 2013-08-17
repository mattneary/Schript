node schript.js defines.sch | \
	./assert.sh 6 "defines"
node schript.js nested_fns.sch | \
	./assert.sh 5 "nested"
node schript.js io.sch | \
	./assert.sh 1 "I/O"	