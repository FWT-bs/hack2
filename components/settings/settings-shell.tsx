"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Shield, Bell, SlidersHorizontal, Eye, Palette, Chrome, User } from "lucide-react"

type ProfilePayload = {
  full_name: string
  school: string
  bio: string
}

type UserSettings = {
  email_room_invites: boolean
  email_focus_recaps: boolean
  push_break_reminders: boolean
  show_real_name: boolean
  share_current_room_with_friends: boolean
  share_focus_history_with_room: boolean
  theme: "light" | "dark" | "system"
  density: "comfortable" | "compact"
}

type UserFocusSettings = {
  default_strictness: "chill" | "standard" | "hardcore"
  grace_seconds_before_warning: number
  max_warnings_before_lock: number
  allow_break_requests: boolean
  auto_share_off_task_events: boolean
}

type SettingsShellProps = {
  email: string | null
}

export function SettingsShell({ email }: SettingsShellProps) {
  const { setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  const [profile, setProfile] = useState<ProfilePayload>({
    full_name: "",
    school: "",
    bio: "",
  })

  const [settings, setSettings] = useState<UserSettings>({
    email_room_invites: true,
    email_focus_recaps: true,
    push_break_reminders: true,
    show_real_name: true,
    share_current_room_with_friends: true,
    share_focus_history_with_room: false,
    theme: "system",
    density: "comfortable",
  })

  const [focusSettings, setFocusSettings] = useState<UserFocusSettings>({
    default_strictness: "standard",
    grace_seconds_before_warning: 30,
    max_warnings_before_lock: 3,
    allow_break_requests: true,
    auto_share_off_task_events: true,
  })

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, prefsRes] = await Promise.all([
          fetch("/api/settings/profile"),
          fetch("/api/settings/preferences"),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile({
            full_name: data.profile?.full_name ?? "",
            school: data.profile?.school ?? "",
            bio: data.profile?.bio ?? "",
          })
        }

        if (prefsRes.ok) {
          const data = await prefsRes.json()
          if (data.settings) {
            const s = data.settings as Partial<UserSettings>
            setSettings((prev) => ({
              ...prev,
              ...s,
            }))
            if (s.theme) setTheme(s.theme)
          }
          if (data.focus) {
            const f = data.focus as Partial<UserFocusSettings>
            setFocusSettings((prev) => ({
              ...prev,
              ...f,
            }))
          }
        }
      } catch {
        // ignore and keep defaults
      } finally {
        setLoading(false)
      }
    }
    load()
    // we intentionally omit setTheme from deps to avoid re-running
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveProfile() {
    setSavingProfile(true)
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.error ?? "Failed to update profile")
        return
      }
      toast.success("Profile updated")
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePreferences() {
    setSavingPrefs(true)
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          focus: focusSettings,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.error ?? "Failed to update preferences")
        return
      }
      setTheme(settings.theme)
      toast.success("Preferences saved")
    } finally {
      setSavingPrefs(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Tune how LockIn feels — from your profile to focus preferences.
          </p>
        </div>
        <Badge variant="outline" className="hidden md:inline-flex">
          <Shield className="h-3 w-3 mr-1.5 text-primary" />
          Designed for gentle accountability
        </Badge>
      </div>

      <Tabs defaultValue="account" className="gap-6" orientation="horizontal">
        <div className="flex flex-col md:flex-row gap-6">
          <TabsList className="md:flex md:flex-col md:h-auto md:w-56 rounded-xl bg-muted/60 p-2">
            <TabsTrigger value="account" className="justify-start gap-2 text-xs md:text-sm rounded-lg px-2 py-1.5">
              <User className="h-3.5 w-3.5" />
              Account
            </TabsTrigger>
            <TabsTrigger value="profile" className="justify-start gap-2 text-xs md:text-sm rounded-lg px-2 py-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-primary/70" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start gap-2 text-xs md:text-sm rounded-lg px-2 py-1.5">
              <Bell className="h-3.5 w-3.5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="focus" className="justify-start gap-2 text-xs md:text-sm rounded-lg px-2 py-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Focus & accountability
            </TabsTrigger>
            <TabsTrigger value="privacy" className="justify-start gap-2 text-xs md:text-sm rounded-lg px-2 py-1.5">
              <Eye className="h-3.5 w-3.5" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="justify-start gap-2 text-xs md:text-sm rounded-lg px-2 py-1.5">
              <Palette className="h-3.5 w-3.5" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="extension" className="justify-start gap-2 text-xs md:text-sm rounded-lg px-2 py-1.5">
              <Chrome className="h-3.5 w-3.5" />
              Extension
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 space-y-4">
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>Account</CardTitle>
                      <CardDescription>
                        Basic info for your LockIn account.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Email
                    </Label>
                    <p className="text-sm font-medium">{email}</p>
                    <p className="text-xs text-muted-foreground">
                      Used for login and important account emails.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    How your name appears to friends and in rooms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                        className="rounded-xl"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school">School (optional)</Label>
                      <Input
                        id="school"
                        value={profile.school}
                        onChange={(e) => setProfile((p) => ({ ...p, school: e.target.value }))}
                        className="rounded-xl"
                        placeholder="e.g. Stanford, South High"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (optional)</Label>
                    <textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                      className="min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                      placeholder="What are you usually studying?"
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown to friends and in room sidebars.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" className="rounded-xl" onClick={saveProfile} disabled={savingProfile || loading}>
                      {savingProfile ? "Saving…" : "Save profile"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Light-touch reminders to keep your group on track.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ToggleRow
                    label="Room invites"
                    description="Email me when someone invites me to a new room."
                    checked={settings.email_room_invites}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, email_room_invites: v }))}
                  />
                  <ToggleRow
                    label="Focus recaps"
                    description="Send me a short recap after longer focus sessions."
                    checked={settings.email_focus_recaps}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, email_focus_recaps: v }))}
                  />
                  <ToggleRow
                    label="Break reminders"
                    description="Nudge me gently if my '5-minute break' turns into 45."
                    checked={settings.push_break_reminders}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, push_break_reminders: v }))}
                  />
                  <div className="flex justify-end pt-1">
                    <Button size="sm" className="rounded-xl" onClick={savePreferences} disabled={savingPrefs || loading}>
                      {savingPrefs ? "Saving…" : "Save notification settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="focus" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Focus & accountability</CardTitle>
                  <CardDescription>
                    Choose how strict LockIn should be when you drift.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Default strictness</Label>
                      <Select
                        value={focusSettings.default_strictness}
                        onValueChange={(v) =>
                          setFocusSettings((f) => ({ ...f, default_strictness: v as UserFocusSettings["default_strictness"] }))
                        }
                      >
                        <SelectTrigger size="default" className="rounded-xl min-w-[160px]">
                          <SelectValue placeholder="Choose strictness" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chill">Chill — gentle warnings only</SelectItem>
                          <SelectItem value="standard">Standard — warn, then lock</SelectItem>
                          <SelectItem value="hardcore">Hardcore — quick locks for distractions</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Used as the default mode for new focus rooms you host.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Warning before lock</Label>
                      <Input
                        type="number"
                        min={5}
                        max={120}
                        className="rounded-xl w-24"
                        value={focusSettings.grace_seconds_before_warning}
                        onChange={(e) =>
                          setFocusSettings((f) => ({
                            ...f,
                            grace_seconds_before_warning: Number(e.target.value || 0),
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Seconds on an unlisted site before we show a soft warning.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Warnings before lock</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        className="rounded-xl w-24"
                        value={focusSettings.max_warnings_before_lock}
                        onChange={(e) =>
                          setFocusSettings((f) => ({
                            ...f,
                            max_warnings_before_lock: Number(e.target.value || 0),
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        After this many warnings on a session, LockIn will fully lock distracting tabs.
                      </p>
                    </div>
                  </div>
                  <ToggleRow
                    label="Allow break requests"
                    description="Let me request short breaks from my room instead of silently leaving."
                    checked={focusSettings.allow_break_requests}
                    onCheckedChange={(v) =>
                      setFocusSettings((f) => ({
                        ...f,
                        allow_break_requests: v,
                      }))
                    }
                  />
                  <ToggleRow
                    label="Share off‑task moments with the room"
                    description="When I drift, add a gentle 'I was off‑task but I’m back' message to the room recap."
                    checked={focusSettings.auto_share_off_task_events}
                    onCheckedChange={(v) =>
                      setFocusSettings((f) => ({
                        ...f,
                        auto_share_off_task_events: v,
                      }))
                    }
                  />
                  <div className="flex justify-end pt-1">
                    <Button size="sm" className="rounded-xl" onClick={savePreferences} disabled={savingPrefs || loading}>
                      {savingPrefs ? "Saving…" : "Save focus settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy</CardTitle>
                  <CardDescription>
                    Decide what your friends and rooms can see.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ToggleRow
                    label="Show my real name in rooms"
                    description="When off, we’ll use your first name or a handle instead."
                    checked={settings.show_real_name}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, show_real_name: v }))}
                  />
                  <ToggleRow
                    label="Let friends see what room I’m in"
                    description="Helps people drop into your study room when you’re online."
                    checked={settings.share_current_room_with_friends}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, share_current_room_with_friends: v }))}
                  />
                  <ToggleRow
                    label="Share focus history with rooms"
                    description="Include high‑level focus stats in room recaps. Never shares your browsing history."
                    checked={settings.share_focus_history_with_room}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, share_focus_history_with_room: v }))}
                  />
                  <div className="flex justify-end pt-1">
                    <Button size="sm" className="rounded-xl" onClick={savePreferences} disabled={savingPrefs || loading}>
                      {savingPrefs ? "Saving…" : "Save privacy settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Match LockIn to your screen and lighting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "light", label: "Light" },
                        { id: "dark", label: "Dark" },
                        { id: "system", label: "System" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings((s) => ({ ...s, theme: opt.id as UserSettings["theme"] }))}
                          className={`rounded-xl border text-xs py-2 px-2.5 flex flex-col items-start gap-1 transition-all ${
                            settings.theme === opt.id
                              ? "border-primary/70 bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/60"
                          }`}
                        >
                          <span className="font-medium">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {opt.id === "system" ? "Follow device setting" : "Always use this theme"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Density</Label>
                    <div className="flex gap-3">
                      {[
                        { id: "comfortable", label: "Comfortable" },
                        { id: "compact", label: "Compact" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setSettings((s) => ({ ...s, density: opt.id as UserSettings["density"] }))
                          }
                          className={`rounded-xl border text-xs py-1.5 px-3 flex items-center gap-1.5 transition-all ${
                            settings.density === opt.id
                              ? "border-primary/70 bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/60"
                          }`}
                        >
                          <span className="font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Compact mode fits more rooms and messages on smaller screens.
                    </p>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button size="sm" className="rounded-xl" onClick={savePreferences} disabled={savingPrefs || loading}>
                      {savingPrefs ? "Saving…" : "Save appearance"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extension" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Extension connection</CardTitle>
                  <CardDescription>
                    Install the Chrome extension so LockIn can gently nudge you when you wander.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    The LockIn extension only runs while you&apos;re in a focus room. It watches for obviously distracting
                    sites and shows a soft overlay that nudges you back to your group instead of shaming you.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      className="rounded-xl gap-2"
                      size="sm"
                      asChild
                    >
                      <a
                        href="https://chromewebstore.google.com/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Chrome className="h-4 w-4" />
                        Open in Chrome Web Store
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      After installing, join a room and use <span className="font-medium">Check my focus</span> to link this
                      browser.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

type ToggleRowProps = {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}

function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        className="mt-1"
      />
    </div>
  )
}

