using ConverterAPI.Controller;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient("CurrencyApi", client =>
{
    client.BaseAddress = new Uri($"https://v6.exchangerate-api.com/v6/{builder.Configuration["ApiKey"]}/latest/");
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapGet("/converter", async (string from, string to, decimal amount, IHttpClientFactory httpClientFactory) => await new ConverterController().Get(from, to, amount, httpClientFactory));

app.Run();

public class ExchangeRates
{
    [JsonPropertyName("conversion_rates")]
    public Dictionary<string, decimal> ConversionRate { get; set; }
}
