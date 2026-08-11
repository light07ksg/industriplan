import { create } from 'zustand'
import { useCanvasStore } from './canvasStore'
import { useAuthStore } from './authStore'
import { createProject, setProjectPublic, updateProjectData, type ProjectRow } from '@/features/projects/projectsApi'

interface ProjectSessionState {
  currentProjectId: string | null
  currentProjectName: string
  currentProjectIsPublic: boolean
  saving: boolean
  lastSavedAt: string | null
  error: string | null
  openProject: (project: ProjectRow) => void
  startNewProject: (name: string) => Promise<void>
  save: () => Promise<void>
  saveAs: (name: string) => Promise<void>
  closeProject: () => void
  renameCurrent: (name: string) => void
  setPublic: (isPublic: boolean) => Promise<void>
}

export const useProjectSessionStore = create<ProjectSessionState>((set, get) => ({
  currentProjectId: null,
  currentProjectName: 'Proyecto sin título',
  currentProjectIsPublic: false,
  saving: false,
  lastSavedAt: null,
  error: null,
  openProject: (project) => {
    useCanvasStore.getState().loadSnapshot(project.canvas_data)
    set({
      currentProjectId: project.id,
      currentProjectName: project.name,
      currentProjectIsPublic: project.is_public ?? false,
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
  saveAs: async (name) => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ saving: true, error: null })
    try {
      const snapshot = useCanvasStore.getState().getSnapshot()
      const project = await createProject(name, user.id)
      await updateProjectData(project.id, name, snapshot)
      set({
        currentProjectId: project.id,
        currentProjectName: name,
        currentProjectIsPublic: false,
        lastSavedAt: new Date().toISOString(),
        saving: false,
      })
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : 'No se pudo guardar como nuevo proyecto' })
    }
  },
  closeProject: () =>
    set({ currentProjectId: null, currentProjectName: 'Proyecto sin título', currentProjectIsPublic: false, lastSavedAt: null }),
  renameCurrent: (name) => set({ currentProjectName: name }),
  setPublic: async (isPublic) => {
    const { currentProjectId } = get()
    if (!currentProjectId) return
    await setProjectPublic(currentProjectId, isPublic)
    set({ currentProjectIsPublic: isPublic })
  },
}))
