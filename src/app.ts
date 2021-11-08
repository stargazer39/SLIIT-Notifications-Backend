import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { SqlConnect } from "./SqlConnect";

dotenv.config();

console.log(process.env.SQL_HOST);
const port = process.env.PORT || 4200;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if(process.env.CORS == 'true'){
    app.use(cors());
}
// Hi
app.use("/", express.static(path.join(__dirname,"./react-app/build/")));


app.get("/api/history/:id", async (req, res) => {
    try{
        let id = Number.parseInt(req.params.id);
        let conn = SqlConnect.getInstance();
        let page = await conn.query({
            sql: "SELECT ph.id, ph.sub_page_id, ph.page_history, ph.date_added, sp.name FROM page_history ph, sub_pages sp WHERE ph.id = ? AND ph.sub_page_id = sp.id ORDER BY id DESC  LIMIT 1",
            values: [id]
        })

        res.json(page[0]);
    }catch(e : any){
         console.log(e);
        res.end(e.message);
    }
})

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname,"./react-app/build/index.html"));
});

async function start() {
    await SqlConnect.init();
    app.listen(port, () => {
        console.log(`Server is listening on ${port}`);
    });
}

start();