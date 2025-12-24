export interface About {
  id: string
  name: string
  title: string
  description: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  logo_url: string | null
  sort_order: number
  created_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  stack: string[]
  image_url: string | null
  project_url: string | null
  sort_order: number
  created_at: string
}

export interface Experience {
  id: string
  company: string
  role: string
  description: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  sort_order: number
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

export type HotspotType = "skills" | "projects" | "about" | "experience" | "contact"

export interface Hotspot {
  id: string
  type: HotspotType
  x: number
  y: number
  radius: number
  label: string
  icon: string
}

export interface AvatarOption {
  id: string
  name: string
  color: string
  preview: string
}
