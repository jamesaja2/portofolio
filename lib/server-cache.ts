// Server-side in-memory cache for admin-created items
// This is used when Supabase is unavailable to persist data during the session

interface CacheStore {
  projects: Map<string, any>
  skills: Map<string, any>
  experience: Map<string, any>
  about: Map<string, any>
}

let cache: CacheStore = {
  projects: new Map(),
  skills: new Map(),
  experience: new Map(),
  about: new Map(),
}

export function getCache() {
  return cache
}

export function addProject(id: string, project: any) {
  cache.projects.set(id, project)
}

export function getProjects() {
  return Array.from(cache.projects.values())
}

export function updateProject(id: string, project: any) {
  cache.projects.set(id, project)
}

export function deleteProject(id: string) {
  cache.projects.delete(id)
}

export function addSkill(id: string, skill: any) {
  cache.skills.set(id, skill)
}

export function getSkills() {
  return Array.from(cache.skills.values())
}

export function updateSkill(id: string, skill: any) {
  cache.skills.set(id, skill)
}

export function deleteSkill(id: string) {
  cache.skills.delete(id)
}

export function addExperience(id: string, experience: any) {
  cache.experience.set(id, experience)
}

export function getExperiences() {
  return Array.from(cache.experience.values())
}

export function updateExperience(id: string, experience: any) {
  cache.experience.set(id, experience)
}

export function deleteExperience(id: string) {
  cache.experience.delete(id)
}

export function setAbout(id: string, about: any) {
  cache.about.set(id, about)
}

export function getAbout() {
  const values = Array.from(cache.about.values())
  return values.length > 0 ? values[0] : null
}

export function clearAllCache() {
  cache = {
    projects: new Map(),
    skills: new Map(),
    experience: new Map(),
    about: new Map(),
  }
}
