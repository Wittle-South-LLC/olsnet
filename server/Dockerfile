FROM ubuntu:16.04
MAINTAINER Eric Wittle "eric@wittlesouth.com"
RUN apt-get update -y
RUN apt-get install -y python3-pip python3-dev build-essential mysql-client libmysqlclient-dev
ADD requirements.txt /
RUN pip3 install -r /requirements.txt
CMD ["bash", "-c", "${SERVER_COMMAND}"]