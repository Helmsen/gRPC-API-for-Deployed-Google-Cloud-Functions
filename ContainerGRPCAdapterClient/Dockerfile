FROM ubuntu:14.04

MAINTAINER Wilhelm Stephan, Leon Graser, Dominik Bäßler

# Folder structure
# ----------------
RUN mkdir -p /fapra

# Files
# -----------------
COPY callMethods.sh /fapra/callMethods.sh

CMD ["/fapra/callMethods.sh", "IP_OF_HOST", "50005"]
