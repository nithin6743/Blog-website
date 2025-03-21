const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const port = 3000;
app.use(express.json());

app.post('/add', (req, res) => {
  const body = req.body;

  fs.readFile(`${__dirname}/data.json`, 'utf-8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ message: 'Error reading the file!' });
    }

    let jsonData = data ? JSON.parse(data) : [];

    jsonData = jsonData.map((item) => ({
      ...item,
      id: item.id + 1, 
    }));

    jsonData.unshift({
      id: 1,
      data: body,
    });

    fs.writeFile(
      `${__dirname}/data.json`,
      JSON.stringify(jsonData, null, 2),
      (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error writing file!' });
        }
        res.status(201).json({ message: 'Data added successfully!' });
        console.log(jsonData);
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
