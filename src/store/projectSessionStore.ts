import { create } from 'zustand'
import { useCanvasStore } from './canvasStore'
import { useAuthStore } from './authStore'
import { createProject, updateProjectData, type ProjectRow } from '@/features/projects/projectsApi'

interface ProjectSessionState {
  currentProjectId: string | null
  currentProjectName: string
  saving: boolean
  lastSavedAt: string | null
  error: string | null
  openProject: (project: ProjectRow) => void
  startNewProject: (name: string) => Promise<void>
  save: () => Promise<void>
  closeProject: () => void
  renameCurrent: (name: string) => void
}

export const useProjectSessionStore = create<ProjectSessionState>((set, get) => ({
  currentProjectId: null,
  currentProjectName: 'Proyecto sin título',
  saving: false,
  lastSavedAt: null,
  error: null,
  openProject: (project) => {
    useCanvasStore.getState().loadSnapshot(project.canvas_data)
    set({
      currentProjectId: project.id,
      currentProjectName: project.name,
      lastSavedAt: project.updated_at,
      error: null,
    })
  },
  startNewProject: async (name) => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ saving: true, error: null })
    try {
      const project = await createProject(name, user.id)
      useCanvasStore.getState().resetCanvas()
      set({
        currentProjectId: project.id,
        currentProjectName: project.name,
        lastSavedAt: project.updated_at,
        saving: false,
      })
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : 'No se pudo crear el proyecto' })
    }
  },
  save: async () => {
    const { currentProjectId, currentProjectName } = get()
    if (!currentProjectId) return
    set({ saving: true, error: null })
    try {
      const snapshot = useCanvasStore.getState().getSnapshot()
      await updateProjectData(currentProjectId, currentProjectName, snapshot)
      set({ saving: false, lastSavedAt: new Date().toISOString() })
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : 'No se pudo guardar' })
    }
  },
  closeProject: () => set({ currentProjectId: null, currentProjectName: 'Proyecto sin título', lastSavedAt: null }),
  renameCurrent: (name) => set({ currentProjectName: name }),
}))
