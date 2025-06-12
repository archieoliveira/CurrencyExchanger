import { test, expect } from '@playwright/test';

test.describe('Currency API', () => {
  const baseURL = 'http://localhost:5133';
  const apiKey = '2269ac6fdd470f82c705af13a5a1a8bc'; // coloque sua chave aqui

  test('deve converter moeda corretamente de acordo com a cotação do dia', async ({ request }) => {
    const from = 'BRL';
    const to = 'USD';
    const amount = 1;

    // Busca cotação na API pública
    const cotacaoResp = await request.get(`https://api.exchangerate.host/convert`, {
      params: { from, to, amount, access_key: apiKey }
    });
    const cotacaoBody = await cotacaoResp.json();
    console.log('cotacaoBody:', cotacaoBody);

    if (!cotacaoBody.result) {
      throw new Error('Erro ao buscar cotação: ' + JSON.stringify(cotacaoBody));
    }

    const expected = cotacaoBody.result;

    // Chama sua API local corretamente!
    const response = await request.get(`${baseURL}/converter`, {
      params: { from, to, amount }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    // Debug: log dos valores
    console.log('expected:', expected, 'convertedAmount:', body.convertedAmount);

    // Valida se ambos são números
    expect(typeof expected).toBe('number');
    expect(typeof body.convertedAmount).toBe('number');

    // Valida se o valor convertido está próximo do esperado
    expect(Math.abs(body.convertedAmount - expected)).toBeLessThan(0.20); // tolerância de 50 centavos
  });
});