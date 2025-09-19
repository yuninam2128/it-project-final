import { useState, useEffect, useCallback } from 'react';

export const useTodos = (todoApplicationService, projectId) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTodos = useCallback(async () => {
    if (!projectId || !todoApplicationService) return;

    try {
      setLoading(true);
      setError(null);
      const todoList = await todoApplicationService.getProjectTodos(projectId);
      setTodos(todoList);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load todos:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, todoApplicationService]);

  const createTodo = useCallback(async (todoData) => {
    if (!projectId || !todoApplicationService) return null;

    try {
      setError(null);
      const todo = await todoApplicationService.createTodo({
        ...todoData,
        projectId
      });
      await loadTodos(); // Reload todos after creation
      return todo;
    } catch (err) {
      setError(err.message);
      console.error('Failed to create todo:', err);
      throw err;
    }
  }, [projectId, todoApplicationService, loadTodos]);

  const updateTodo = useCallback(async (todoId, updates) => {
    if (!todoApplicationService) return null;

    try {
      setError(null);
      const todo = await todoApplicationService.updateTodo(todoId, { updates });
      await loadTodos(); // Reload todos after update
      return todo;
    } catch (err) {
      setError(err.message);
      console.error('Failed to update todo:', err);
      throw err;
    }
  }, [todoApplicationService, loadTodos]);

  const deleteTodo = useCallback(async (todoId) => {
    if (!todoApplicationService) return;

    try {
      setError(null);
      await todoApplicationService.deleteTodo(todoId);
      await loadTodos(); // Reload todos after deletion
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete todo:', err);
      throw err;
    }
  }, [todoApplicationService, loadTodos]);

  const toggleTodoComplete = useCallback(async (todoId, completed) => {
    return updateTodo(todoId, { completed });
  }, [updateTodo]);

  useEffect(() => {
    if (projectId) {
      loadTodos();
    } else {
      setTodos([]);
      setLoading(false);
    }
  }, [projectId, loadTodos]);

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    refreshTodos: loadTodos
  };
};