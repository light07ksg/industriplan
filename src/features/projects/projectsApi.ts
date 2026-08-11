import { supabase } from '@/lib/supabase'
import type { CanvasSnapshot } from '@/store/canvasStore'

export interface ProjectRow {
  id: string
  owner_id: string
  name: string
  canvas_data: CanvasSnapshot
  is_public: boolean
  created_at: string
  updated_at: string
}

export async function listProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ProjectRow[]
}

export async function createProject(name: string, ownerId: string): Promise<ProjectRow> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, owner_id: ownerId, canvas_data: {} })
    .select()
    .single()
  if (error) throw error
  return data as ProjectRow
}

export async function updateProjectData(id: string, name: string, canvasData: CanvasSnapshot): Promise<void> {
  const { error } = await supabase.from('projects').update({ name, canvas_data: canvasData }).eq('id', id)
  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function setProjectPublic(id: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase.from('projects').update({ is_public: isPublic }).eq('id', id)
  if (error) throw error
}

/** Fetches a project for the public read-only share view — works without a session because the
 * "select_public_projects" RLS policy allows it once the project is marked is_public. */
export async function getPublicProject(id: string): Promise<ProjectRow | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).eq('is_public', true).maybeSingle()
  if (error) throw error
  return data as ProjectRow | null
}
