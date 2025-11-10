const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Proxy de CUITonline con Puppeteer funcionando. Usa la ruta /consultar/:cuit');
});

app.get('/consultar/:cuit', async (req, res) => {
  const cuit = req.params.cuit;
  const url = `https://www.cuitonline.com.ar/verifica-cuit.php?cuit=${cuit}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
      const razonSocial = document.querySelector('.razon-social')?.textContent.trim() || '';
      const domicilio = document.querySelector('.domicilio')?.textContent.trim() || '';
      const estado = document.querySelector('.estado')?.textContent.trim() || '';
      return { razonSocial, domicilio, estado };
    });

    if (!data.razonSocial && !data.domicilio && !data.estado) {
      res.status(404).json({ error: 'No se encontró información para ese CUIT' });
    } else {
      res.json(data);
    }

  } catch (error) {
    console.error('Error en Puppeteer:', error);
    res.status(500).json({ error: 'Error interno del servidor' });

  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
