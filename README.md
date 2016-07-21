# gRPC API for Deployed Google Cloud Functions

The Google Cloud Functions adapter reads a protobuf file which describes deployed
functions and makes them available via gRPC.
Google Cloud Functions are public by default.
That's why you don't have to authorize against
Google.
Just run ```docker-compose up``` to build and run a preconfigured scenario.
The gRPC adapter client will call a gRPC-to-GraphQL-adapter which calls a
Google Cloud Functions API adapter which calls
a public function computing the reverse string of "Leon".
