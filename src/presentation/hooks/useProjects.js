import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.js';

export const useProjects = (projectApplicationService) => {
  const [projects, setProjects] = useState([]);
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadProjects = useCallback(async () => {
    if (!user?.uid || !projectApplicationService) return;

    try {
      setLoading(true);
      setError(null);
      const result = await projectApplicationService.getUserProjects(user.uid);
      setProjects(result.projects);
      setPositions(result.positions);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, projectApplicationService]);

  const createProject = useCallback(async (projectData) => {
    if (!user?.uid || !projectApplicationService) return null;

    try {
      setError(null);
      const project = await projectApplicationService.createProject({
        ...projectData,
        ownerId: user.uid
      });
      await loadProjects(); // Reload projects after creation
      return project;
    } catch (err) {
      setError(err.message);
      console.error('Failed to create project:', err);
      throw err;
    }
  }, [user?.uid, projectApplicationService, loadProjects]);

  const updateProject = useCallback(async (projectId, updates) => {
    if (!projectApplicationService) return null;

    try {
      setError(null);
      const project = await projectApplicationService.updateProject(projectId, { updates });
      await loadProjects(); // Reload projects after update
      return project;
    } catch (err) {
      setError(err.message);
      console.error('Failed to update project:', err);
      throw err;
    }
  }, [projectApplicationService, loadProjects]);

  const updateProjectPosition = useCallback(async (projectId, position) => {
    if (!projectApplicationService) return;

    try {
      setError(null);
      await projectApplicationService.updateProjectPosition(projectId, position);
      // Update local state immediately for better UX
      setPositions(prev => ({
        ...prev,
        [projectId]: position
      }));
    } catch (err) {
      setError(err.message);
      console.error('Failed to update project position:', err);
      throw err;
    }
  }, [projectApplicationService]);

  const updateMultipleProjectPositions = useCallback(async (positionsUpdate) => {
    if (!projectApplicationService) return;

    try {
      setError(null);
      await projectApplicationService.updateMultipleProjectPositions(positionsUpdate);
      // Update local state immediately
      setPositions(prev => ({
        ...prev,
        ...positionsUpdate
      }));
    } catch (err) {
      setError(err.message);
      console.error('Failed to update multiple project positions:', err);
      throw err;
    }
  }, [projectApplicationService]);

  const deleteProject = useCallback(async (projectId) => {
    if (!projectApplicationService) return;

    try {
      setError(null);
      await projectApplicationService.deleteProject(projectId);
      await loadProjects(); // Reload projects after deletion
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete project:', err);
      throw err;
    }
  }, [projectApplicationService, loadProjects]);

  const subscribeToProjects = useCallback(() => {
    if (!user?.uid || !projectApplicationService) return () => {};

    return projectApplicationService.subscribeToUserProjects(user.uid, (result) => {
      setProjects(result.projects);
      setPositions(result.positions);
      setLoading(false);
    });
  }, [user?.uid, projectApplicationService]);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeToProjects();
      return unsubscribe;
    } else {
      setProjects([]);
      setPositions({});
      setLoading(false);
    }
  }, [user?.uid, subscribeToProjects]);

  return {
    projects,
    positions,
    loading,
    error,
    createProject,
    updateProject,
    updateProjectPosition,
    updateMultipleProjectPositions,
    deleteProject,
    refreshProjects: loadProjects
  };
};