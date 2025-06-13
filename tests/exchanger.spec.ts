import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Currency API', () => {
  const baseURL = 'http://localhost:5133';
  const apiKey = '2269ac6fdd470f82c705af13a5a1a8bc'; // coloque sua chave aqui

  test('deve converter moeda corretamente de acordo com a cotação do dia', async ({ request }) => {
    const from = 'BRL';
    const to = 'USD';
    const amount = 1;

    // Criação do diretório de resultados
    const resultDir = path.join(__dirname, '../test-results');
    if (!fs.existsSync(resultDir)) {
      fs.mkdirSync(resultDir, { recursive: true });
    }

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

    const responseBody = await response.json();

    // SALVAR LOG E RESPOSTA
    const logContent = [
      `Data: ${new Date().toISOString()}`,
      `Status: ${response.status()}`,
      `URL: ${response.url()}`,
      `Headers: ${JSON.stringify(response.headers(), null, 2)}`,
      `Expected: ${expected}`,
      `Converted: ${responseBody.convertedAmount}`,
    ].join('\n');

    fs.writeFileSync(path.join(resultDir, 'log.txt'), logContent);
    fs.writeFileSync(path.join(resultDir, 'response.json'), JSON.stringify(responseBody, null, 2));

    // Asserções
    expect(response.ok()).toBeTruthy();
    expect(typeof expected).toBe('number');
    expect(typeof responseBody.convertedAmount).toBe('number');
    expect(Math.abs(responseBody.convertedAmount - expected)).toBeLessThan(0.20); // tolerância
  });
});
