FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copiare il file csproj e ripristinare le dipendenze
COPY Backend/*.csproj ./
RUN dotnet restore

# Copiare tutto il resto e compilare
COPY Backend/. ./
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .

# Creare directory per il database
RUN mkdir -p /app/data

# Esporre la porta
EXPOSE 8080

# Avviare l'applicazione
ENTRYPOINT ["dotnet", "CasaPrenotazioni.API.dll"]
