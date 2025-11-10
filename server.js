const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/consultar/:cuit', async (req, res) => {
  const cuit = req.params.cuit;
  const url = `https://www.cuitonline.com.ar/verifica-cuit.php?cuit=${cuit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: 'Error al consultar cuitonline' });
    }

    const text = await response.text();

    const dom = new JSDOM(text);
    const document = dom.window.document;

    // Ajusta estos selectores inspeccionando cuitonline real
    const razonSocialElem = document.querySelector('.razon-social');
    const domicilioElem = document.querySelector('.domicilio');
    const estadoElem = document.querySelector('.estado');

    const razonSocial = razonSocialElem ? razonSocialElem.textContent.trim() : '';
    const domicilio = domicilioElem ? domicilioElem.textContent.trim() : '';
    const estado = estadoElem ? estadoElem.textContent.trim() : '';

    if (!razonSocial && !domicilio && !estado) {
      return res.status(404).json({ error: 'No se encontró información para ese CUIT' });
    }

    res.json({ razonSocial, domicilio, estado });

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});