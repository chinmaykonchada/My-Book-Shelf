import express from 'express';
import bodyParser from "body-parser";
import pg from "pg";

const app=express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "My-Book-Shelf",
    password: "chinmay@123",
    port: 5432,
});
db.connect();

let books=[
    {title:"the 5 am club", lastedited:"2:4:2023", rating:5, description:"contesdfasdfadf", notes:"nogasafaf"},
    {title:"the 5 am club", lastedited:"2:4:2023", rating:5, description:"contesdfasdfadf", notes:"nogasafaf"}
]

app.get('/', async (req, res) => {
    const result=await db.query("SELECT title, lastedited, rating, description FROM books");
    // console.log(result.rows);
    books=result.rows.map(book => {
        const date=new Date(book.lastedited);
        return {
            ...book,
            lastedited: date.toLocaleDateString()
        };
    });
    res.render("index.ejs", {allbooks: books});
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})