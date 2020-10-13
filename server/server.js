//Budget API

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const data = require('./budget-data.json')

app.use(cors());

  app.get('/budget', (req, res) => {
    res.json(data);
});
  
  app.listen(port, () => {
    console.log(`API Serving at http://localhost:${port}`)
  });

    