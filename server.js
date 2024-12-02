const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(express.static('public'));


app.use(cors());


app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2002',
    database: 'mqtt_messages',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL');
});


app.post('/saveMessage', (req, res) => {
    const { RFID, Hora, Fecha, Peso } = req.body;

    const query = `INSERT INTO messages (RFID, Hora, Fecha, Peso) VALUES (?, ?, ?, ?)`;
    db.query(query, [RFID, Hora, Fecha, Peso], (err, result) => {
        if (err) {
            console.error('Error saving message:', err.message);
            return res.status(500).send('Error saving message');
        }
        res.status(200).send('Message saved successfully');
    });
});

app.get('/getMessages', (req, res) => {
    const query = 'SELECT * FROM messages';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving messages:', err.message);
            return res.status(500).send('Error retrieving messages');
        }
        res.status(200).json(results);
    });
});


app.delete('/deleteMessage/:rfid', async (req, res) => {
    const { rfid } = req.params;
    try {
        const query = 'DELETE FROM mensajes WHERE RFID = ?';
        const [result] = await db.query(query, [rfid]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Registro eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Registro no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el registro' });
    }
  });

  app.post('/save-entry', (req, res) => {
    const { weight, time, date } = req.body;

    const query = 'INSERT INTO entries (weight, time, date) VALUES (?, ?, ?)';
    db.query(query, [weight, time, date], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al guardar entrada');
        } else {
            res.status(200).send('Entrada guardada');
        }
    });
});

app.delete('/delete-entry/:id', (req, res) => {
    const id = req.params.id;

    const query = 'DELETE FROM entries WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al eliminar registro');
        } else {
            res.status(200).send('Registro eliminado');
        }
    });
});


const PORT = 3000;
app.listen(PORT, "0.0.0.0",() => {
    console.log(`Server running on port ${PORT}`);
});
