FROM mcr.microsoft.com/dotnet/core/sdk:2.1-alpine

WORKDIR /app

COPY . /app

RUN dotnet build

ENTRYPOINT dotnet watch run 

EXPOSE 5000