import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('Todos')

const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos for user');
  return todosAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  try {
    logger.info("Creating new todo");
    if (createTodoRequest.name.trim().length == 0) {
      throw new Error("Name can't be empty string");
    }

    const itemId = uuid.v4()
    const createdAt = new Date().toISOString()
    const attachmentUrl = `https://${AttachmentUtils.bucketName}.s3.amazonaws.com/${itemId}`

    logger.info('Creating Todo: ' + itemId)
    logger.info('User ID: ' + userId)
    logger.info('Created At: ' + createdAt)
    logger.info('Name: ' + createTodoRequest.name)
    logger.info('Due Date: ' + createTodoRequest.dueDate)
    logger.info('Attachement URL' + attachmentUrl)


    return await todosAccess.createTodo({
      todoId: itemId,
      userId: userId,
      createdAt: createdAt,
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false,
      attachmentUrl: attachmentUrl
    })
  } catch (error) {
    createError(error);
  }

}
export async function updateTodo(
  todoItemId: string,
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
): Promise<TodoUpdate> {

  try {
    logger.info("Updating todo");


    if (updateTodoRequest.name.trim().length == 0) {
      throw new Error("Name can't be empty string");
    }

    return await todosAccess.updateTodo(todoItemId = todoItemId, updateTodoRequest, userId);
  } catch (error) {
    createError(error);
  }
}

export async function deleteTodo(todoItemId: string, userId: string) {
  try {
    logger.info("Deleting todo");

    return await todosAccess.deleteTodo(todoItemId, userId);
  } catch (error) {
    createError(error);
  }
}

export async function createAttachmentPresignedUrl(imageId: string, userId: string) {
  try {
    if (!userId)
      throw new Error("User Id missing");

    return await attachmentUtils.getUploadUrl(imageId);
  } catch (error) {
    createError(error);
  }
}