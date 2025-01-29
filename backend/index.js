import express from 'express';
import mongoose from 'mongoose';
import { PORT , mongoDBURL} from './config.js';

const app = express();

app.use(express.json());


app.get('/',(request,response)=>{
    return response.status(234).send("Hurray First route");
});

app.post('/books', async (request, response) =>{
    try{
       console.log(request.body.title);
       return response.status(400).send(request.body.title)
    }catch(error){
        console.log(error);
        response.status(500).send({message:error.message})
    }
})

mongoose
    .connect(mongoDBURL)
    .then(()=>{
        console.log("connected to Database");
        app.listen(PORT, () => {
            console.log(`App is listening to port:${PORT}`)
        });
        
    })
    .catch((error)=>{
        console.log(error);
        
    });

