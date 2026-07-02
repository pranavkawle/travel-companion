using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;

namespace TravelCompanion.Api.Services;

public interface IFlightService
{
    Task<List<FlightDto>> SearchFlightsAsync(string originIata, string destinationIata, DateOnly date);
    Task<List<AirportDto>> SearchAirportsAsync(string query);
}

public class FlightService : IFlightService
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly TravelCompanionDbContext _db;

    public FlightService(HttpClient httpClient, IConfiguration config, TravelCompanionDbContext db)
    {
        _httpClient = httpClient;
        _apiKey = config["AVIATIONSTACK_API_KEY"];
        _db = db;
    }

    public async Task<List<FlightDto>> SearchFlightsAsync(
        string originIata, string destinationIata, DateOnly date)
    {
        if (string.IsNullOrEmpty(_apiKey))
            return [];

        var url = $"http://api.aviationstack.com/v1/flights" +
            $"?access_key={_apiKey}" +
            $"&dep_iata={originIata}" +
            $"&arr_iata={destinationIata}" +
            $"&flight_date={date:yyyy-MM-dd}";

        try
        {
            var response = await _httpClient.GetFromJsonAsync<AviationStackResponse>(url);
            if (response?.Data == null) return [];

            return response.Data.Select(f => new FlightDto
            {
                FlightNumber = $"{f.Airline?.Iata ?? ""}{f.Flight?.Number ?? ""}",
                Airline = f.Airline?.Name ?? "",
                OriginIata = f.Departure?.Iata ?? "",
                DestinationIata = f.Arrival?.Iata ?? "",
                DepartureTime = ParseDateTime(f.Departure?.Scheduled),
                ArrivalTime = ParseDateTime(f.Arrival?.Scheduled)
            }).ToList();
        }
        catch
        {
            return [];
        }
    }

    public async Task<List<AirportDto>> SearchAirportsAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            return [];

        var upperQuery = query.ToUpperInvariant();
        var airports = await _db.Airports
            .Where(a => a.IataCode.Contains(upperQuery) ||
                        a.Name.Contains(query) ||
                        a.City.Contains(query))
            .Take(20)
            .ToListAsync();

        return airports.Select(a => new AirportDto
        {
            IataCode = a.IataCode,
            Name = a.Name,
            City = a.City,
            Country = a.Country,
            Timezone = a.Timezone
        }).ToList();
    }

    private static DateTimeOffset ParseDateTime(string? value)
    {
        if (string.IsNullOrEmpty(value)) return DateTimeOffset.UtcNow;
        return DateTimeOffset.TryParse(value, out var dt) ? dt : DateTimeOffset.UtcNow;
    }

    private class AviationStackResponse
    {
        public List<AviationStackFlight>? Data { get; set; }
    }

    private class AviationStackFlight
    {
        public AviationStackAirline? Airline { get; set; }
        public AviationStackFlightInfo? Flight { get; set; }
        public AviationStackAirport? Departure { get; set; }
        public AviationStackAirport? Arrival { get; set; }
    }

    private class AviationStackAirline
    {
        public string? Name { get; set; }
        public string? Iata { get; set; }
    }

    private class AviationStackFlightInfo
    {
        public string? Number { get; set; }
    }

    private class AviationStackAirport
    {
        public string? Iata { get; set; }
        public string? Scheduled { get; set; }
    }
}
