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

function getBalance(statements) {
    return statements.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount;
        } else if (operation.type === 'withdraw') {
            return acc - operation.amount;
        } else {
            return 0;
        }
    }, 0);
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

app.get('/statements', verifyIfExistsAccountCPF, (request, response) => {

    return response.json(request.customer.statements)
})

app.get('/statements/date', verifyIfExistsAccountCPF, (request, response) => {
    const { customer, query: { date } } = request;
    const dateFormat = new Date(date + " 00:00");

    const statements = customer.statements.filter(statement => 
        new Date(statement.created_at).toDateString() === dateFormat.toDateString())

    return response.json(statements)
})

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {

    const { body: { description, amount }, customer } = request;

    customer.statements.push({
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    })

    return response.status(201).send()
})

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {

    const { body: { amount }, customer } = request;

    const balance = getBalance(customer.statements)

    if (balance < amount) {
        return response.status(400).json({
            error: "Insufficient funds!"
        })
    }

    customer.statements.push({
        amount,
        created_at: new Date(),
        type: 'withdraw'
    })

    return response.status(201).send()
})

app.listen(3333, null, () => console.log('🚀 listening port 3333 ...'))