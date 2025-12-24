"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import WindowFrame from "@/components/window-frame"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, FileText, Code2, Briefcase, Mail, LogOut, Home, Users, Send } from "lucide-react"
import { palette } from "@/lib/palette"
import styles from "@/styles/habbo.module.css"
import { cn } from "@/lib/utils"
import AboutEditor from "./about-editor"
import SkillsEditor from "./skills-editor"
import ProjectsEditor from "./projects-editor"
import ExperienceEditor from "./experience-editor"
import MessagesViewer from "./messages-viewer"
import MailingListViewer from "./mailing-list-viewer"
import EmailCenter from "./email-center"

interface Props {
  userEmail: string
}

const tabs = [
  { value: "about", label: "About", icon: User },
  { value: "skills", label: "Skills", icon: Code2 },
  { value: "projects", label: "Projects", icon: FileText },
  { value: "experience", label: "Experience", icon: Briefcase },
  { value: "messages", label: "Messages", icon: Mail },
  { value: "mailinglist", label: "Mailing List", icon: Users },
  { value: "email", label: "Email Center", icon: Send },
]

export default function AdminDashboard({ userEmail }: Props) {
  const [activeTab, setActiveTab] = useState<string>("about")
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: `linear-gradient(180deg, ${palette.blueLight} 0%, ${palette.blueDark} 100%)` }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[12%] w-32 h-8 bg-white/60 rounded-full" />
        <div className="absolute top-16 left-[20%] w-20 h-6 bg-white/50 rounded-full" />
        <div className="absolute top-6 right-[18%] w-40 h-10 bg-white/55 rounded-full" />
        <div className="absolute top-20 right-[30%] w-28 h-8 bg-white/45 rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={styles.logoBlock} style={{ background: `linear-gradient(#ffd166, #f29c1f)` }}>
              <span className={styles.logoWord} style={{ fontSize: 18 }}>
                ADMIN PANEL
              </span>
            </div>
            <div className="rounded-lg border-2 border-black px-3 py-2 bg-white/80 shadow-[0_2px_0_rgba(0,0,0,0.25)]">
              <p className="text-xs font-semibold text-slate-700">Logged in as</p>
              <p className="text-sm font-bold text-slate-900">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/")}
              className={`${styles.pixelButton} flex items-center gap-2 h-10`}
            >
              <Home className="w-4 h-4" /> Visit Site
            </Button>
            <Button onClick={handleLogout} className={`${styles.pixelButton} flex items-center gap-2 h-10`}
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>

        <WindowFrame
          title="Control Center"
          initial={{ x: 0, y: 0, w: 980, h: undefined }}
          className="!static !transform-none w-full"
        >
          <div className="p-4 sm:p-6 space-y-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={cn(styles.tabBar, "flex-wrap overflow-x-auto")}
                data-testid="admin-tabs"
              >
                {tabs.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={cn(styles.tab, activeTab === value && styles.tabActive, "flex items-center gap-2")}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="border-2 border-black rounded-b-xl bg-[#eef6fb] px-3 sm:px-4 py-5 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
                <TabsContent value="about" className="m-0">
                  <AboutEditor />
                </TabsContent>
                <TabsContent value="skills" className="m-0">
                  <SkillsEditor />
                </TabsContent>
                <TabsContent value="projects" className="m-0">
                  <ProjectsEditor />
                </TabsContent>
                <TabsContent value="experience" className="m-0">
                  <ExperienceEditor />
                </TabsContent>
                <TabsContent value="messages" className="m-0">
                  <MessagesViewer />
                </TabsContent>
                <TabsContent value="mailinglist" className="m-0">
                  <MailingListViewer />
                </TabsContent>
                <TabsContent value="email" className="m-0">
                  <EmailCenter />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </WindowFrame>
      </div>
    </div>
  )
}
