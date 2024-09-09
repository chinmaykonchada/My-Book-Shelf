import express from 'express';
import bodyParser from "body-parser";
import pg from "pg";
import axios from 'axios';

const app=express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));// to use files in public folder which are static

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "My-Book-Shelf",
    password: "chinmay@123",
    port: 5432,
});
db.connect();

let books=[]

app.get('/', async (req, res) => {
    try {
        // This line starts a try-catch block to handle potential errors in the following code
        
        const result = await db.query("SELECT id, title, lastedited, rating, description, isbn FROM books");
        // This line performs an asynchronous database query
        // It selects specific columns (title, lastedited, rating, description, isbn) from the 'books' table
        // The result is stored in the 'result' variable
        // console.log(typeof(result.rows));
        const books = result.rows.map(book => {
            // This starts a mapping operation on the rows returned by the database query
            // For each book in the result, we're creating a new object
            
            const date = new Date(book.lastedited);
            // This creates a new Date object from the 'lastedited' field of each book
            
            return {
                ...book,
                // This spreads all existing properties of the book object into the new object
                lastedited: date.toLocaleDateString()
                // This overwrites the 'lastedited' property with a formatted date string
            };
        });
        
        // Fetch cover images for all books
        const booksWithCovers = await Promise.all(books.map(async (book) => {
            // This starts another mapping operation, but this time it's asynchronous
            // We're using Promise.all to wait for all these operations to complete
            
            try {
                // This starts another try-catch block for each individual book cover fetch
                
                const response = await axios.get(`https://covers.openlibrary.org/b/ISBN/${book.isbn}-M.jpg`, {
                    responseType: 'arraybuffer'
                });
                // This makes an asynchronous GET request to the OpenLibrary API to fetch the book cover
                // The URL is constructed using the book's ISBN
                // The response type is set to 'arraybuffer' to receive binary data
                
                const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                // This converts the binary image data to a base64-encoded string
                
                return { ...book, coverImage: `data:image/jpeg;base64,${base64Image}` };
                // This returns a new object with all the book's properties plus a new 'coverImage' property
                // The 'coverImage' is a data URL that can be used directly in an <img> tag
            } catch (error) {
                console.error(`Failed to fetch cover for ${book.title}:`, error);
                // If there's an error fetching the cover, it's logged to the console
                
                return { ...book, coverImage: null };
                // In case of an error, we still return the book object, but with coverImage set to null
            }
        }));
        
        res.render("index.ejs", { allbooks: booksWithCovers });
        // This renders the 'index.ejs' template, passing the booksWithCovers array as the 'allbooks' variable

    } catch (error) {
        console.error('Error:', error);
        // If there's an error in the main try block, it's logged to the console
        
        res.status(500).send('An error occurred');
        // A 500 (Internal Server Error) response is sent to the client
    }
});

app.get("/book/:id", async(req, res) => {
    const id=req.params.id;
    // console.log(id);
    try{
        const result = await db.query("SELECT id, title, lastedited, rating, description, isbn FROM books WHERE id=$1", [id]);
        const book=result.rows[0];
        const date = new Date(book.lastedited);
        book.lastedited=date.toLocaleDateString();
        try{
            const response = await axios.get(`https://covers.openlibrary.org/b/ISBN/${book.isbn}-M.jpg`, {
                responseType: 'arraybuffer'
            });
            const base64Image = Buffer.from(response.data, 'binary').toString('base64');
            book.coverImage=`data:image/jpeg;base64,${base64Image}`;
        }catch{
            console.error(`Failed to fetch cover for ${book.title}:`, error);                
            book.coverImage=null;
        }
        // console.log(book);
        // notes
        const notesresult=await db.query("SELECT * FROM notesofbooks WHERE id=$1", [id]);
        //
        // console.log(notesresult.rows[0].notes);
        book.notes=notesresult.rows[0].notes; // new property with key as notes and value as notes fetched form the database.
        res.render("book.ejs", {book: book})
    }catch(error){
        console.error('Error:', error);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});