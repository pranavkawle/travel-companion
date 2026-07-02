using MongoDB.Driver;
using TravelCompanion.Api.Models.Domain;

namespace TravelCompanion.Api.Data;

public static class SeedData
{
    public static async Task SeedAsync(IMongoDatabase mongoDb)
    {
        // Seed airports
        var airportsCol = mongoDb.GetCollection<Airport>("Airports");
        if (await airportsCol.CountDocumentsAsync(FilterDefinition<Airport>.Empty) == 0)
        {
            var airports = new List<Airport>
            {
                new() { IataCode = "DEL", Name = "Indira Gandhi International Airport", City = "New Delhi", Country = "India", Timezone = "Asia/Kolkata" },
                new() { IataCode = "BOM", Name = "Chhatrapati Shivaji Maharaj International Airport", City = "Mumbai", Country = "India", Timezone = "Asia/Kolkata" },
                new() { IataCode = "MAA", Name = "Chennai International Airport", City = "Chennai", Country = "India", Timezone = "Asia/Kolkata" },
                new() { IataCode = "BLR", Name = "Kempegowda International Airport", City = "Bengaluru", Country = "India", Timezone = "Asia/Kolkata" },
                new() { IataCode = "HYD", Name = "Rajiv Gandhi International Airport", City = "Hyderabad", Country = "India", Timezone = "Asia/Kolkata" },
                new() { IataCode = "CCU", Name = "Netaji Subhas Chandra Bose International Airport", City = "Kolkata", Country = "India", Timezone = "Asia/Kolkata" },
                new() { IataCode = "SYD", Name = "Sydney Kingsford Smith Airport", City = "Sydney", Country = "Australia", Timezone = "Australia/Sydney" },
                new() { IataCode = "MEL", Name = "Melbourne Airport", City = "Melbourne", Country = "Australia", Timezone = "Australia/Melbourne" },
                new() { IataCode = "SIN", Name = "Singapore Changi Airport", City = "Singapore", Country = "Singapore", Timezone = "Asia/Singapore" },
                new() { IataCode = "DXB", Name = "Dubai International Airport", City = "Dubai", Country = "UAE", Timezone = "Asia/Dubai" },
                new() { IataCode = "LHR", Name = "Heathrow Airport", City = "London", Country = "UK", Timezone = "Europe/London" },
                new() { IataCode = "JFK", Name = "John F. Kennedy International Airport", City = "New York", Country = "USA", Timezone = "America/New_York" },
                new() { IataCode = "LAX", Name = "Los Angeles International Airport", City = "Los Angeles", Country = "USA", Timezone = "America/Los_Angeles" },
            };
            await airportsCol.InsertManyAsync(airports);
        }

        // Seed languages
        var langsCol = mongoDb.GetCollection<Language>("Languages");
        if (await langsCol.CountDocumentsAsync(FilterDefinition<Language>.Empty) == 0)
        {
            var languages = new List<Language>
            {
                new() { Code = "hi", DisplayName = "Hindi" },
                new() { Code = "ta", DisplayName = "Tamil" },
                new() { Code = "te", DisplayName = "Telugu" },
                new() { Code = "bn", DisplayName = "Bengali" },
                new() { Code = "mr", DisplayName = "Marathi" },
                new() { Code = "gu", DisplayName = "Gujarati" },
                new() { Code = "kn", DisplayName = "Kannada" },
                new() { Code = "ml", DisplayName = "Malayalam" },
                new() { Code = "pa", DisplayName = "Punjabi" },
                new() { Code = "ur", DisplayName = "Urdu" },
                new() { Code = "en", DisplayName = "English" },
                new() { Code = "ar", DisplayName = "Arabic" },
                new() { Code = "zh", DisplayName = "Chinese" },
                new() { Code = "es", DisplayName = "Spanish" },
                new() { Code = "fr", DisplayName = "French" },
            };
            await langsCol.InsertManyAsync(languages);
        }
    }
}
