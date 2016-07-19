#!/bin/bash

HOST=$1
PORT=$2

printf "\n"
echo "Wait 10s until adapter is initialized"
sleep 10s

printf "\ņ"
echo "Adapter address: ${HOST}:${PORT}"

printf "\n"
echo "Call reverse() on Google Cloud Functions adapter"
out=$(curl ${HOST}:${PORT}/graphql -XPOST -H "Content-Type:application/graphql" --data "{reverse(service:\"LeonsTestService\", input:{name:\"Leon\"}){requestId}}")
requestId=$( echo "$out" | grep "requestId")
requestId="$( sed 's/.*requestId\": \"\(.*\)\"/\1/' <<< $requestId)"
echo "  RequestId: $requestId"

printf "\n"
echo "Wait 5s"
sleep 5s

printf "\n"
echo "Call reverseStatus() on Google Cloud Functions adapter"
out=$(curl ${HOST}:${PORT}/graphql -XPOST -H "Content-Type:application/graphql" --data "{reverseStatus(input:{requestId:\"${requestId}\"}){status,result{name}}}")
echo "  Result:"
echo "  $out"
