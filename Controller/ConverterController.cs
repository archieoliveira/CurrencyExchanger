namespace ConverterAPI.Controller
{
    public class ConverterController 
    {
        public async Task<IResult> Get(string from, string to, decimal amount, IHttpClientFactory httpClientFactory)
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

            return Results.Ok(new { from, to, amount, convertedAmount });
        }
    }
}
