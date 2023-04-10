import * as AWS from 'aws-sdk'
const AWSXRay = require('aws_xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {}

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos for User: ' + userId)

        const result = await this.docClient
            .query({
                TableName: this.todosTable,
                IndexName: this.todosIndex,
                ExpressionAttributeValues: {
                    'userId': userId
                },
                KeyConditionExpression: 'userId = :userId'
            })
            .promise()

        const items = result.Items
        logger.info('Items returning: ' + items)
        return items as TodoItem[]
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating a todo: ' + todoItem)
        logger.info('todoItem userId: ' + todoItem.userId)
        logger.info('todoItem todoId: ' + todoItem.todoId)
        logger.info('todoItem createdAt: ' + todoItem.createdAt)
        logger.info('todoItem name: ' + todoItem.name)
        logger.info('todoItem dueDate: ' + todoItem.dueDate)
        logger.info('todoItem done: ' + todoItem.done)
        logger.info('todoItem attachmentUrl: ' + todoItem.attachmentUrl)
        await this.docClient
          .put({
            TableName: this.todosTable,
            Item: todoItem
          })
          .promise()
    
        return todoItem
      }
    
      async updateTodo(
        todoId: string,
        todo: TodoUpdate,
        userId: string
      ): Promise<TodoUpdate> {
        logger.info('Updating a todo')
        
        logger.info('updating a todo: ' + todoId)
        logger.info('new todo userId: ' + userId)
        logger.info('new todo name: ' + todo.name)
        logger.info('new todo dueDate: ' + todo.dueDate)
        logger.info('new todo done: ' + todo.done)

        const updated = await this.docClient
          .update({
            TableName: this.todosTable,
            Key: {
              userId: userId,
              todoId: todoId
            },
            ExpressionAttributeNames: {
              '#todo_name': 'name'
            },
            ExpressionAttributeValues: {
              ':name': todo.name,
              ':dueDate': todo.dueDate,
              ':done': todo.done
            },
            UpdateExpression:
              'SET #todo_name = :name, dueDate = :dueDate, done = :done',
            ReturnValues: 'ALL_NEW'
          })
          .promise()
    
        logger.info(updated.Attributes)
        return todo
      }
    
      async deleteTodo(todoItemId: string, userId: string): Promise<boolean> {
        logger.info('Deleting a todo: ' + todoItemId)
        logger.info('From User: ' + userId)
        await this.docClient
          .delete({
            TableName: this.todosTable,
            Key: {
              todoId: todoItemId,
              userId: userId
            }
          })
          .promise()
    
        return true
      }
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }