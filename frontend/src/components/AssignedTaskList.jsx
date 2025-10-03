"use client"

import { useEffect, useMemo, useState } from "react"

const API_BASE = "https://lif-lkgk.onrender.com"

export default function AssignedTaskListPage({ eid: propEid } = {}) {
  const [eid, setEid] = useState(propEid || "")
  const [tasks, setTasks] = useState([])
  const [selectedMonth, setSelectedMonth] = useState("")
  const [months, setMonths] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [availableEids, setAvailableEids] = useState([])
  const [completedMap, setCompletedMap] = useState({})

  useEffect(() => {
    if (propEid) {
      setEid(propEid)
      fetchTasks(propEid)
      return
    }

    const directEid = localStorage.getItem("eid") || localStorage.getItem("employeeId")
    if (directEid) {
      setEid(directEid)
      fetchTasks(directEid)
    }

    fetchAvailableEids()
  }, [propEid])

  const fetchAvailableEids = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${API_BASE}/api/users/eids`, { headers })
      if (!res.ok) return
      const data = await res.json()
      setAvailableEids(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("[v0] Error fetching EIDs", err)
    }
  }

  const fetchTasks = async (selectedEid) => {
    if (!selectedEid) {
      setError("No employee id provided")
      setTasks([])
      return
    }
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const url = `${API_BASE}/api/assigned-task?eid=${encodeURIComponent(selectedEid)}`
      const res = await fetch(url, { headers })
      if (!res.ok) {
        const txt = await res.text()
        console.error("[v0] assigned-task fetch failed", res.status, txt)
        setError("Failed to fetch assigned tasks")
        setTasks([])
        return
      }
      const data = await res.json()
      const rows = Array.isArray(data) ? data : []

      // flatten docs with nested tasks for easier rendering
      const flat = []
      rows.forEach((doc) => {
        if (Array.isArray(doc.tasks) && doc.tasks.length > 0) {
          doc.tasks.forEach((t) =>
            flat.push({
              _id: doc._id,
              eid: doc.eid,
              year: doc.year,
              month: doc.month,
              projectType: t.projectType,
              assigned: t.assigned,
              completed: t.completed,
            }),
          )
        } else {
          flat.push(doc)
        }
      })
      setTasks(flat)

      const ms = Array.from(new Set(flat.map((r) => `${r.year}-${String(r.month).padStart(2, "0")}`)))
      ms.sort((a, b) => b.localeCompare(a))
      setMonths(ms)
      if (ms.length) setSelectedMonth(ms[0])

      fetchCompletedProjects(selectedEid, flat)
    } catch (err) {
      console.error("[v0] fetch assigned tasks error", err)
      setError("Error fetching assigned tasks")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCompletedProjects = async (selectedEid, assignedRows = []) => {
    try {
      const token = localStorage.getItem("token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${API_BASE}/api/edit/all`, { headers })
      if (!res.ok) return
      const all = await res.json()
      const approved = Array.isArray(all) ? all.filter((t) => t.approval === "approved" && t.eid === selectedEid) : []

      const m = {}
      approved.forEach((t) => {
        let year = "",
          month = ""
        if (t.date && typeof t.date === "string") {
          const parts = t.date.split("-")
          if (parts.length >= 2) {
            year = parts[0]
            month = parts[1]
          }
        }
        const key = `${year}-${month}-${(t.projecttype || "").toLowerCase()}`
        if (!m[key]) m[key] = new Set()
        if (t.projectname) m[key].add(t.projectname)
      })

      const out = {}
      Object.keys(m).forEach((k) => {
        out[k] = Array.from(m[k])
      })
      assignedRows.forEach((r) => {
        const k = `${r.year || ""}-${String(r.month).padStart(2, "0")}-${(r.projectType || "").toLowerCase()}`
        if (!out[k]) out[k] = []
      })

      setCompletedMap(out)
    } catch (err) {
      console.error("[v0] Error fetching completed projects", err)
    }
  }

  const onSelectChange = (e) => {
    const val = e.target.value
    setEid(val)
    fetchTasks(val)
  }

  const filteredTasks = useMemo(() => {
    return selectedMonth
      ? tasks.filter((t) => `${t.year}-${String(t.month).padStart(2, "0")}` === selectedMonth)
      : tasks
  }, [tasks, selectedMonth])

  const totalAssigned = filteredTasks.reduce((s, r) => s + (Number(r.assigned) || 0), 0)
  const totalCompleted = filteredTasks.reduce((s, r) => s + (Number(r.completed) || 0), 0)
  const completionRate = totalAssigned === 0 ? 0 : Math.round((totalCompleted / totalAssigned) * 100)

  const recentProjects = useMemo(() => {
    const names = new Set()
    Object.keys(completedMap).forEach((k) => {
      if (!selectedMonth) return
      if (k.startsWith(selectedMonth)) {
        ;(completedMap[k] || []).forEach((n) => names.add(n))
      }
    })
    return Array.from(names).slice(0, 6)
  }, [completedMap, selectedMonth])

  const getEmployee = (eidVal) => {
    if (!eidVal) return null
    return availableEids.find((u) => (u.employeeId || u.eid) === eidVal) || null
  }

  const ProgressRing = ({ value = 0, size = 120, strokeWidth = 12 }) => {
    const r = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * r
    const clamp = Math.min(100, Math.max(0, value))
    const offset = circumference - (clamp / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} role="img" aria-label={`Completion ${value}%`} className="block">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute text-xl font-semibold text-foreground">{clamp}%</div>
      </div>
    )
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-8">
        {/* Header */}
        <header className="mb-8 rounded-xl bg-primary p-6 text-primary-foreground shadow-sm ring-1 ring-primary/20">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-pretty text-3xl font-semibold tracking-tight">Employee Performance Dashboard</h1>
              <p className="mt-2 text-sm/6 opacity-90">Track assignments, completions, and progress at a glance.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-sm">
              <span className="h-2 w-2 rounded-full bg-primary-foreground/80" aria-hidden />
              <span className="font-medium">Red & White Theme</span>
            </div>
          </div>
        </header>

        {/* Filters and Summary */}
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Employee Selector */}
          <div className="rounded-lg border border-primary/20 bg-card p-4 transition-colors hover:border-primary/40">
            <label className="text-sm font-medium">Employee</label>
            <select
              value={eid}
              onChange={onSelectChange}
              disabled={!!propEid}
              className="mt-2 block w-full rounded-md border border-primary/30 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Employee</option>
              {availableEids.map((u) => (
                <option key={u.employeeId || u.eid} value={u.employeeId || u.eid}>
                  {(u.employeeId || u.eid) + " - " + (u.name || "")}
                </option>
              ))}
            </select>
            {!!propEid && <p className="mt-2 text-xs text-muted-foreground">Employee context pre-selected</p>}
          </div>

          {/* Month Filter */}
          <div className="rounded-lg border border-primary/20 bg-card p-4 transition-colors hover:border-primary/40">
            <label className="text-sm font-medium">MONTH</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-2 block w-full rounded-md border border-primary/30 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">Monthly performance data</p>
          </div>

          {/* Quick Stats */}
          <div className="rounded-lg border border-primary/20 bg-card p-4 transition-colors hover:border-primary/40">
            <label className="text-sm font-medium">Task Summary</label>
            <div className="mt-3 grid grid-cols-3 items-center gap-2">
              <div className="text-center">
                <div className="text-2xl font-semibold">{totalAssigned}</div>
                <div className="text-xs text-muted-foreground">Assigned</div>
              </div>
              <div className="h-10 w-px justify-self-center bg-border" />
              <div className="text-center">
                <div className="text-2xl font-semibold">{totalCompleted}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="col-span-3 mt-3 rounded-md bg-primary px-3 py-2 text-center text-primary-foreground shadow-xs">
                <span className="text-sm font-medium">Completion: {completionRate}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Employee Info */}
          <div className="rounded-lg border border-primary/20 bg-card p-4">
            <h3 className="text-sm font-medium">Employee Information</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-lg font-semibold">{getEmployee(eid)?.name?.charAt(0) || "—"}</span>
              </div>
              <div>
                <div className="text-sm font-medium">{getEmployee(eid)?.name || "Not Selected"}</div>
                <div className="text-xs text-muted-foreground">ID: {eid || "—"}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{getEmployee(eid)?.email || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{getEmployee(eid)?.department || "—"}</span>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="rounded-lg border border-primary/20 bg-card p-4">
            <h3 className="text-sm font-medium">Overall Completion Rate</h3>
            <div className="mt-4 flex items-center gap-4">
              <ProgressRing value={completionRate} size={120} strokeWidth={12} />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted" />
                  <span>Assigned: {totalAssigned}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Completed: {totalCompleted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="rounded-lg border border-primary/20 bg-card p-4">
            <h3 className="text-sm font-medium">Active Task Assignments</h3>
            <div className="mt-4 text-center">
              <div className="text-4xl font-semibold">{filteredTasks.length}</div>
              <div className="text-xs text-muted-foreground">Active Tasks</div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium">
                  {
                    filteredTasks.filter((t) => {
                      const c = Number(t.completed) || 0
                      const a = Number(t.assigned) || 0
                      return c > 0 && c < a
                    }).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">
                  {filteredTasks.filter((t) => (Number(t.completed) || 0) === 0).length}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-3 text-sm font-medium">Recently Completed Projects</h3>
            <div className="flex flex-wrap gap-2">
              {recentProjects.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Error / Loading */}
        {error && <div className="mb-6 rounded-md border border-destructive bg-card px-4 py-3 text-sm">{error}</div>}
        {loading && (
          <div className="mb-6 rounded-md border border-border bg-card px-4 py-3 text-sm">
            Loading performance data...
          </div>
        )}

        {/* Table */}
        {!loading && (
          <>
            {filteredTasks.length === 0 ? (
              <div className="rounded-lg border border-primary/20 bg-card p-8 text-center">
                <div className="mx-auto h-10 w-10 rounded-full bg-primary/10" aria-hidden />
                <h4 className="mt-4 text-base font-semibold">No Task Assignments Found</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select an employee and reporting period to view performance data.
                </p>
              </div>
            ) : (
              <section className="overflow-hidden rounded-lg border border-primary/20 bg-card">
                <div className="flex items-center justify-between border-b border-primary/20 bg-primary/5 px-4 py-3">
                  <h3 className="text-sm font-medium">Task Performance Details</h3>
                  <div className="text-xs text-muted-foreground">
                    Showing {filteredTasks.length} assignment{filteredTasks.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="px-4 py-2 font-medium">Employee ID</th>
                        <th className="px-4 py-2 font-medium">Project Name</th>
                        <th className="px-4 py-2 font-medium">Project Type</th>
                        <th className="px-4 py-2 text-center font-medium">Assigned</th>
                        <th className="px-4 py-2 text-center font-medium">Completed</th>
                        <th className="px-4 py-2 font-medium">Progress Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((t, i) => {
                        const key = `${t.year || ""}-${String(t.month).padStart(2, "0")}-${(t.projectType || "").toLowerCase()}`
                        const names = completedMap[key] || []
                        const assigned = Number(t.assigned) || 0
                        const completed = Number(t.completed) || 0
                        const pct = assigned > 0 ? Math.round((completed / assigned) * 100) : completed > 0 ? 100 : 0
                        const isComplete = pct >= 100 && completed > 0

                        return (
                          <tr
                            key={`${t._id}::${t.projectType}::${i}`}
                            className="border-t border-border hover:bg-primary/5"
                          >
                            <td className="px-4 py-2">{t.eid}</td>
                            <td className="px-4 py-2">{(names && names[0]) || "—"}</td>
                            <td className="px-4 py-2">
                              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs">
                                {t.projectType}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center tabular-nums">{assigned}</td>
                            <td className="px-4 py-2 text-center tabular-nums">{completed}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-full max-w-[180px] rounded-full bg-muted">
                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                                <div className="text-xs">
                                  {isComplete ? (
                                    <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground">
                                      Complete
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">{pct}%</span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
