FROM ubuntu:16.10
MAINTAINER Eric Wittle "eric@wittlesouth.com"
RUN apt-get update -y
RUN apt-get install -y python3-pip python3-dev build-essential mysql-client libmysqlclient-dev sudo
# Below doesn't seem to work to get time correct on server
# RUN sudo echo "America/New_York" > /etc/timezone
# RUN sudo dpkg-reconfigure -f noninteractive tzdata
ADD requirements.txt /
RUN pip3 install -r /requirements.txt
CMD ["bash", "-c", "${SERVER_COMMAND}"]