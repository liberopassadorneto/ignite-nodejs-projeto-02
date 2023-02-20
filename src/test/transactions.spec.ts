import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../app'
import { CreateTransactionBody } from '../schemas/transactions.schema'

describe('Transactions Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    const newTransaction: CreateTransactionBody = {
      title: 'Salary',
      amount: 12000,
      type: 'income',
    }

    const response = await request(app.server)
      .post('/transactions')
      .send(newTransaction)

    expect(response.status).toBe(201)
  })

  it('should be able to find all transactions', async () => {
    const newTransaction: CreateTransactionBody = {
      title: 'Salary',
      amount: 12000,
      type: 'income',
    }

    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(newTransaction)

    const cookies = createTransactionResponse.headers['set-cookie']

    const result = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(result.status).toBe(200)
    expect(result.body.transactions).toEqual([
      expect.objectContaining({
        title: newTransaction.title,
        amount: newTransaction.amount,
      }),
    ])
  })

  it('should be able to find a transaction by id', async () => {
    const newTransaction: CreateTransactionBody = {
      title: 'Salary',
      amount: 12000,
      type: 'income',
    }

    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(newTransaction)

    const cookies = createTransactionResponse.headers['set-cookie']

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const result = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)

    expect(result.status).toBe(200)

    expect(result.body.transaction).toEqual(
      expect.objectContaining({
        title: newTransaction.title,
        amount: newTransaction.amount,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const incomeTransaction: CreateTransactionBody = {
      title: 'Salary',
      amount: 12000,
      type: 'income',
    }

    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(incomeTransaction)

    const cookies = createTransactionResponse.headers['set-cookie']

    const outcomeTransaction: CreateTransactionBody = {
      title: 'Rent',
      amount: 1200,
      type: 'outcome',
    }

    await request(app.server)
      .post('/transactions')
      .send(outcomeTransaction)
      .set('Cookie', cookies)

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(summaryResponse.status).toBe(200)

    expect(summaryResponse.body.summary).toEqual(
      expect.objectContaining({
        total: incomeTransaction.amount - outcomeTransaction.amount,
      }),
    )
  })
})
