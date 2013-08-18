read resp; 
if [ -z "$resp" ]
then echo "failure for test: $*"
else echo "success for test: $*"
fi