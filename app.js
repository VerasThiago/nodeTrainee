const express = require('express');
const app = express();

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

app.get('/', (req, res) => {
    res.send('Server up!');
}); 

app.listen(PORT, HOST);


