import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { PORT, mongoDBURL } from './config.js';
import { Book } from './models/bookModel.js';
const app = express();

app.use(express.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: './uploads/', // Ensure the 'uploads/' folder exists
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.post('/books', upload.single('image'), async (request, response) => {
    try {
        const { title, author, publishYear } = request.body;
        const imageUrl = request.file ? `/uploads/${request.file.filename}` : null;

        // Validate required fields
        if (!title || !author || !publishYear) {
            return response.status(400).json({ message: "All fields (title, author, publishYear) are required." })
        }

        const findBookExists = await Book.findOne({ title });

        if (findBookExists) {
            return response.status(400).json({ message: 'Book with this title already exists!' });
        }
        const newBook = new Book({ title, author, publishYear, imageUrl });

        await newBook.save();
        return response.status(201).json({ title, author, publishYear, imageUrl });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
})

app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        return res.status(200).json({ books })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/book/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params
        const { title, author, publishYear } = req.body;
        if (!title || !author || !publishYear) {
            return res.status(400).json({ message: "All fields (title, author, publishYear) are required." });
        }

        const findBookAndUpdate = await Book.findById(id);

        if (!findBookAndUpdate) {
            return res.status(404).json({ message: "Book not found to update!" });
        }
        if (req.file) {
            if (Book.imageUrl) {
                const oldImagePath = `.${Book.imageUrl}`;
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Delete old image
                }
            }
            Book.imageUrl = `/uploads/${req.file.filename}`;
        }
        Book.title = title;
        Book.author = author;
        Book.publishYear = publishYear;
        return res.status(201).json(Book);
    } catch (error) {
        return res.status(500).json({ message: error })
    }
});

app.delete('/book/:id', async (req, res) => {
    try {
        const findByAndDelete = await Book.findByIdAndDelete(req.params.id);
        if (!findByAndDelete) {
            return res.status(404).json({ message: "Book not found to delete!" })
        }
        return res.status(200).json({ message: "Deleted Successfully!" });
    } catch (error) {
        return res.status(500).json({ message: error })
    }
})

mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log("connected to Database");
        app.listen(PORT, () => {
            console.log(`App is listening to port:${PORT}`);
        });

    })
    .catch((error) => {
        console.log(error);

    });

