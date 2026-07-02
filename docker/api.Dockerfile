FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/TravelCompanion.Api/TravelCompanion.Api.csproj", "src/TravelCompanion.Api/"]
RUN dotnet restore "src/TravelCompanion.Api/TravelCompanion.Api.csproj"
COPY . .
WORKDIR "/src/src/TravelCompanion.Api"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TravelCompanion.Api.dll"]
