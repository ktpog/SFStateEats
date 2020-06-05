const express = require('express');
const path = require('path');

const app = express();
const port = 4000;
const frontendBuildPath = '../prototype/build';

// Static file react server
app.use(express.static(path.join(__dirname, frontendBuildPath)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, `${frontendBuildPath}/index.html`));
});

app.listen(port, () => console.log(`fileServer is running on port: ${port}`));
