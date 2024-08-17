import express from 'express';
import bp from "body-parser";

const app=express();
const port = 3000;

let books=[
    {title:"the 5 am club", timestamp:"2:4:2023", rating:5, description:"contesdfasdfadf", notes:"nogasafaf"},
    {title:"the 5 am club", timestamp:"2:4:2023", rating:5, description:"contesdfasdfadf", notes:"nogasafaf"}
]

app.get('/', (req, res) => {
    res.render("index.ejs", {allbooks: books});
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})