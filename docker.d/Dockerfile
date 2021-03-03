FROM public.ecr.aws/amazonlinux/amazonlinux:2

RUN yum update -y; \
  yum install -y git unzip;

# install aws-cli v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
  unzip awscliv2.zip && \
  ./aws/install
