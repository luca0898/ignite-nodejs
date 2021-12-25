import express from "express";
import { v4 } from "uuid";

const app = express();

app.use(express.json())

let customers = []

app.get('/account', (request, response) => {

    return response.json({ customers })
})


app.post('/account', (request, response) => {

    const { cpf, name } = request.body;

    customers.push({
        cpf,
        name,
        id: v4(),
        statement: []
    })

    return response.status(201).send();
})

app.listen(3333, null, () => console.log('🚀 listening port 3333 ...'))