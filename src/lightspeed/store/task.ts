export type TaskSchemas = taskExists
| removeTask

export interface taskExists {
  taskId: bigint
}

export interface removeTask {
  taskId: bigint
}
