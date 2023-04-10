import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import * as createError from 'http-errors'
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    try {

      logger.info('Processing event: ', event);

      const newTodo: CreateTodoRequest = JSON.parse(event.body);
      const userId = getUserId(event);

      const newItem = await createTodo(newTodo, userId);

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          "item": newItem
        })
      }
    } catch (error) {
      createError(error);
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
