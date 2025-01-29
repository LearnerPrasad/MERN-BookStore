import express from 'express';
import mongoose from 'mongoose';
import { PORT, mongoDBURL } from './config.js';
import { Book } from './models/bookModel.js';
const app = express();

app.use(express.json());


app.post('/books', async (request, response) => {
    try {
        const { title, author, publishYear } = request.body;

        // Validate required fields
        if (!title || !author || !publishYear) {
            return response.status(400).json({ message: "All fields (title, author, publishYear) are required." })
        }

        const findBookExists = await Book.findOne({ title });

        if (findBookExists) {
            return response.status(400).json({ message: 'Book with this title already exists!' });
        }
        const newBook = new Book({ title, author, publishYear });

        await newBook.save();
        return response.status(201).json({ title, author, publishYear });

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

app.put('/book/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { title, author, publishYear } = req.body;
        if (!title || !author || !publishYear) {
            return res.status(400).json({ message: "All fields (title, author, publishYear) are required." });
        }

        const findBookAndUpdate = await Book.findByIdAndUpdate(id, { title, author, publishYear }, { new: true });

        if (!findBookAndUpdate) {
            return res.status(404).json({ message: "Book not found to update!" });
        }
        return res.status(201).json(findBookAndUpdate);
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
        return res.status(200).json({message:"Deleted Successfully!"});
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

