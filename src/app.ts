import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

const Database = require("sqlite-async");

import { SqlConnect } from "./SqlConnect";


// Get .env Environment variables
dotenv.config();


const port = process.env.PORT || 4200;
const app = express();
let sqlCachedb : any = null;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Bypass CORS when in local environment
if(process.env.CORS == 'true'){
    app.use(cors());
}

// Serve react app
app.use("/", express.static(path.join(__dirname,"./react-app/build/")));


app.get("/api/history/:id", async (req, res) => {
    try{
        let id = Number.parseInt(req.params.id);

        try{
            let row = await sqlCachedb.get(`SELECT * FROM history_cache WHERE id = ?`,[id]);
            if(row) {
                console.log("Cache hit "+ id);
                res.json(row);
                return;
            }
        }catch(e){
            console.log(e);
        }
        let conn = SqlConnect.getInstance();
        let page = await conn.query({
            sql: "SELECT ph.id, ph.sub_page_id, ph.page_history, ph.date_added, sp.name FROM page_history ph, sub_pages sp WHERE ph.id = ? AND ph.sub_page_id = sp.id ORDER BY id DESC  LIMIT 1",
            values: [id]
        })
        res.json(page[0]);
        try{
            await sqlCachedb.run(`INSERT INTO history_cache VALUES (?,?,?,?,?)`,[page[0].id, page[0].name, page[0].sub_page_id, page[0].page_history, page[0].date_added])
        }catch(e){
            console.log(e);
        }
    }catch(e : any){
         console.log(e);
        res.end(e.message);
    }
})

app.get("/api/groups",async (req,res) => {
    try{
        let conn = SqlConnect.getInstance();
        let groups = await conn.query({
            sql: "SELECT * FROM telegram_urls"
        })
        res.json(groups);
    }catch(e){
        console.log(e);
    }
})
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname,"./react-app/build/index.html"));
});

// Entrypoint
async function start() {
    // Start cache database
    sqlCachedb =  await Database.open("cache.db");
    await sqlCachedb.run(`CREATE TABLE IF NOT EXISTS history_cache(
        id int PRIMARY KEY,
        name varchar(255),
        sub_page_id int,
        page_history text,
        date_added datetime )`);
    let res = await sqlCachedb.run("SELECT * FROM history_cache");
    console.log(res);
    //let statement = sqlCachedb.prepare("");
    await SqlConnect.init();
    app.listen(port, () => {
        console.log(`Server is listening on ${port}`);
    });
}

start();