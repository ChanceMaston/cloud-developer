import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as createError from 'http-errors'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';

import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {

    //Get Current User
    const current_user = getUserId(event)

    // Get Todos for current user
    const todos = await getTodosForUser(current_user)

    return {
      statusCode: 200,
      body: JSON.stringify({
        "items": todos
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
