FROM ubuntu:16.04
MAINTAINER Eric Wittle "eric@wittlesouth.com"
RUN apt-get update -y
RUN apt-get install -y python3-pip python3-dev build-essential mysql-client libmysqlclient-dev
ADD requirements.txt /
RUN pip3 install -r /requirements.txt
ADD /src /app
WORKDIR /app
ENV BASE_CONNECT_STRING="mysql+mysqldb://test:test@database/test?charset=utf8mb4"
ENV BASE_SECRET_KEY="My Secret"
ENTRYPOINT ["python3"]
CMD ["server.py"]
