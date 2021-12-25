import express from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(express.json())

let customers = []

app.post('/account', (request, response) => {

    const { cpf, name } = request.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf)

    if (customerAlreadyExists) {
        return response.status(400).json({
            error: "Customer already exists!"
        })
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    })

    return response.status(201).send();
})

app.get('/statement/:cpf', (request, response) => {
    const { cpf } = request.params

    const customer = customers.find(customer => customer.cpf === cpf)

    if (!customer){
        return response.status(400).json({
            error: "Customer don't exist!"
        })
    }

    return response.json(customer.statement)
})

app.listen(3333, null, () => console.log('🚀 listening port 3333 ...'))