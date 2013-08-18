goal=$1
shift
grep "^$goal$" | tests/render.sh $*