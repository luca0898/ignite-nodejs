import express from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(express.json())

let customers = []

function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers

    const customer = customers.find(customer => customer.cpf === cpf)

    if (!customer) {
        return response.status(400).json({
            error: "Customer not found!"
        })
    }

    request.customer = customer;

    next();
}

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
        statements: []
    })

    return response.status(201).send();
})

app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {

    return response.json(request.customer.statements)
})

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {

    const { body: { description, amount }, customer } = request;

    customer.statements.push({
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    })

    return response.status(201).json()
})

app.listen(3333, null, () => console.log('🚀 listening port 3333 ...'))