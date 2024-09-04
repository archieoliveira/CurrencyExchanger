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
app.MapGet("/converter", async (string from, string to, decimal amount, IHttpClientFactory httpClientFactory) =>
{
    var client = httpClientFactory.CreateClient("CurrencyApi");
    var response = await client.GetAsync($"{from}");

    if (!response.IsSuccessStatusCode)
        return Results.Problem("Erro ao obter taxa de câmbio...");

    var rates = await response.Content.ReadFromJsonAsync<ExchangeRates>();
        
    if (rates is null || !rates.ConversionRate.ContainsKey(to))
        return Results.Problem("Taxa de cambio não encontrada...");

    var rate = rates.ConversionRate[to];
    var convertedAmount = amount * rate;

    return Results.Ok(new {from, to, amount, convertedAmount});
    
});

app.Run();

public class ExchangeRates
{
    [JsonPropertyName("conversion_rates")]
    public Dictionary<string, decimal> ConversionRate { get; set; }
}
