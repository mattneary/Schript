node schript.js example.sch | \
	./assert.sh 6 "example"
node schript.js nested_fns.sch | \
	./assert.sh 5 "nested"