import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from "path";

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json')

// Enable CORS only for specified frontend origins
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5000',
        'http://localhost:5500/'
    ]
}));

// Enable JSON body parsing
app.use(express.json());

// Start server
app.listen(port, () => {
    console.log(`Running on: http://127.0.0.1:${port}`);
});

// Scrapes a chapter page
app.get("/s", async (req, res) => {
    try {
        // Extract URL from query string
        const { url } = req.query;

        // Fetch target page
        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
            },
            validateStatus: () => true
        });

        // Load HTML into Cheerio to get its HTML components
        const $ = cheerio.load(response.data);
        const data = [];
        const page = $("title").text().split("Chapter");
        const title = page[0]
        const chapter = page[1]

        // Store data with chapter title and chapter number
        data.push({
            title: title,
            chapter: chapter
        })

        // Store each image, that has the .imgholder class(domain specific), source as an object in json data
        $('.imgholder').each((i, el) => {
            data.push({
                src: $(el).attr('src')
            });
        });

        // Send data
        res.json({
            data: data
        })
    } catch (error) {
        // Invalid URL format
        if (error.code === "ERR_INVALID_URL") {
            res.status(404).json({ error: "URL inválida! Verifique o endereço informado. Utilizando o formato: http://127.0.0.1:300/s?url=sua_url" });

        // Any other error
        } else {
            res.status(500).json({
                erro: "Falha ao processar a página"
            });
        }
    }
});

// Updates the local database with the latest chapter info
app.post('/u', async (req, res) => {
    try {
        // Collect data sent
        const chapter = req.body.chapter;
        const url = req.body.url;


        // Read db file
        const fileData = await fs.readFile(dbPath, 'utf8');
        const db = JSON.parse(fileData);

        // Update latest chapter visit with new info
        if (db.chapter < chapter) {
            db.chapter = chapter
            db.url = url
            
            // Write new info into the database
            await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        }

        res.sendStatus(200)

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to update db'
        });
    }
})

// Returns saved reading progress
app.get('/db', async (req, res) => {
    // Read db file
    const fileData = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(fileData);

    // Return the saved url and chapter number
    res.json({ url: db.url, chapter: db.chapter })
})