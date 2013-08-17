defun(fact, n) {
	if(n) {
		*(n, fact(-(n, 1)))
	} {
		return(1)
	}
}
fact(4)