"use client"

import { useState } from "react"
import axios from "axios"
import {
  Save,
  X,
  FileText,
  PlusCircle,
  Trash2,
  Calendar,
  Camera,
  Video,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./ProjectForm.css"

const deliverableOptions = [
  {
    key: "traditionalPhotography",
    label: "Traditional Photography",
    desc: "Professional event photography coverage including key ceremonies",
    icon: Camera,
    category: "Photography Services",
  },
  {
    key: "traditionalCinematography",
    label: "Traditional Cinematography",
    desc: "Comprehensive video documentation of all major events",
    icon: Video,
    category: "Video Services",
  },
  {
    key: "candidPhotography",
    label: "Candid Photography",
    desc: "Natural, unposed photography capturing authentic moments",
    icon: Camera,
    category: "Photography Services",
  },
  {
    key: "candidCinematography",
    label: "Candid Cinematography",
    desc: "Documentary-style video recording of spontaneous moments",
    icon: Video,
    category: "Video Services",
  },
  {
    key: "digitalAlbum",
    label: "Digital Album",
    desc: "Secure online gallery with high-resolution downloads and sharing capabilities",
    icon: FileText,
    category: "Digital Deliverables",
  },
  {
    key: "premiumWeddingBook",
    label: "Premium Photo Album",
    desc: "Professional hardcover album with premium materials and extended warranty",
    icon: Building2,
    category: "Physical Products",
  },
  {
    key: "weddingDeliverablesIntimate",
    label: "Complete Digital Package",
    desc: "Comprehensive digital delivery including raw files and edited collections",
    icon: FileText,
    category: "Digital Deliverables",
  },
  {
    key: "videoPackage",
    label: "Complete Video Package",
    desc: "Full video production including highlight reels and complete ceremony footage",
    icon: Video,
    category: "Video Services",
  },
]

const defaultDay = {
  date: "",
  traditionalPhotographers: 0,
  traditionalCinematographers: 0,
  candidPhotographers: 0,
  candidcinematographers: 0,
  aerialCinematography: false,
  additionalNotes: "",
}

const ProjectForm = () => {
  const [form, setForm] = useState({
    projectName: "",
    projectType: "",
    startDate: "",
    endDate: "",
    dayWiseRequirements: [{ ...defaultDay }],
    deliverables: [],
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDayChange = (idx, e) => {
    const days = [...form.dayWiseRequirements]
    const { name, type, value, checked } = e.target
    days[idx][name] = type === "checkbox" ? checked : value
    setForm({ ...form, dayWiseRequirements: days })
  }

  const addDay = () => {
    setForm({ ...form, dayWiseRequirements: [...form.dayWiseRequirements, { ...defaultDay }] })
  }

  const removeDay = (idx) => {
    const days = form.dayWiseRequirements.filter((_, i) => i !== idx)
    setForm({ ...form, dayWiseRequirements: days })
  }

  const handleDeliverableChange = (key) => {
    setForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.includes(key)
        ? prev.deliverables.filter((d) => d !== key)
        : [...prev.deliverables, key],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setLoading(true)

    if (!form.projectName.trim() || !form.projectType.trim() || !form.startDate || !form.endDate) {
      setError("Please complete all required project information fields.")
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(" https://lif-lkgk.onrender.com/api/projectdetails", form, {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      })

      if (response.status === 201 || response.status === 200) {
        setMessage("Project has been created successfully.")
        setForm({
          projectName: "",
          projectType: "",
          startDate: "",
          endDate: "",
          dayWiseRequirements: [{ ...defaultDay }],
          deliverables: [],
        })
        setTimeout(() => {
          setMessage("")
        }, 3000)
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create project. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const groupedDeliverables = deliverableOptions.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="app-container">
      
      
      <main className="main-content">
        <div className="content-container">
          <div className="page-header">
            <FileText size={28} className="page-icon" />
            <div className="page-title-section">
              <h2 className="page-title">Create New Project</h2>
              <p className="page-description">Configure project requirements and service specifications</p>
            </div>
          </div>

          <form className="project-form" onSubmit={handleSubmit}>
            {message && (
              <div className="alert alert-success">
                <CheckCircle2 size={20} />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-section">
              <div className="section-header">
                <Building2 size={20} />
                <h3 className="section-title">Project Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">
                    Project Name <span className="required">*</span>
                  </label>
                  <input
                    className="field-input"
                    name="projectName"
                    placeholder="Enter project name"
                    value={form.projectName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">
                    Project Type <span className="required">*</span>
                  </label>
                  <input
                    className="field-input"
                    name="projectType"
                    placeholder="e.g., Wedding, Corporate Event, Portrait Session"
                    value={form.projectType}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">
                    Start Date <span className="required">*</span>
                  </label>
                  <input
                    className="field-input"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">
                    End Date <span className="required">*</span>
                  </label>
                  <input
                    className="field-input"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <Calendar size={20} />
                <h3 className="section-title">Daily Requirements</h3>
              </div>
              <div className="days-container">
                {form.dayWiseRequirements.map((day, idx) => (
                  <div key={idx} className="day-card">
                    <div className="day-card-header">
                      <div className="day-info">
                        <span className="day-label">Day {idx + 1}</span>
                        <input
                          className="field-input date-input"
                          type="date"
                          name="date"
                          value={day.date}
                          onChange={(e) => handleDayChange(idx, e)}
                          required
                        />
                      </div>
                      {form.dayWiseRequirements.length > 1 && (
                        <button type="button" className="remove-btn" onClick={() => removeDay(idx)} title="Remove Day">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="crew-grid">
                      <div className="crew-field">
                        <label className="field-label">
                          <Camera size={16} />
                          Traditional Photographers
                        </label>
                        <input
                          className="field-input number-input"
                          type="number"
                          name="traditionalPhotographers"
                          value={day.traditionalPhotographers}
                          onChange={(e) => handleDayChange(idx, e)}
                          min="0"
                        />
                      </div>
                      <div className="crew-field">
                        <label className="field-label">
                          <Video size={16} />
                          Traditional Cinematographers
                        </label>
                        <input
                          className="field-input number-input"
                          type="number"
                          name="traditionalCinematographers"
                          value={day.traditionalCinematographers}
                          onChange={(e) => handleDayChange(idx, e)}
                          min="0"
                        />
                      </div>
                      <div className="crew-field">
                        <label className="field-label">
                          <Camera size={16} />
                          Candid Photographers
                        </label>
                        <input
                          className="field-input number-input"
                          type="number"
                          name="candidPhotographers"
                          value={day.candidPhotographers}
                          onChange={(e) => handleDayChange(idx, e)}
                          min="0"
                        />
                      </div>
                      <div className="crew-field">
                        <label className="field-label">
                          <Video size={16} />
                          Candid Cinematographers
                        </label>
                        <input
                          className="field-input number-input"
                          type="number"
                          name="candidcinematographers"
                          value={day.candidcinematographers}
                          onChange={(e) => handleDayChange(idx, e)}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="checkbox-field">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="aerialCinematography"
                          checked={day.aerialCinematography}
                          onChange={(e) => handleDayChange(idx, e)}
                        />
                        <span className="checkbox-text">Aerial Cinematography (Drone Services)</span>
                      </label>
                    </div>

                    <div className="form-field">
                      <label className="field-label">Additional Requirements</label>
                      <textarea
                        className="field-textarea"
                        name="additionalNotes"
                        placeholder="Specify any special requirements, timing preferences, or equipment needs..."
                        value={day.additionalNotes}
                        onChange={(e) => handleDayChange(idx, e)}
                        rows="3"
                      />
                    </div>
                  </div>
                ))}

                <button type="button" className="add-day-btn" onClick={addDay}>
                  <PlusCircle size={18} />
                  Add Additional Day
                </button>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <FileText size={20} />
                <h3 className="section-title">Service Deliverables</h3>
              </div>
              <div className="deliverables-container">
                {Object.entries(groupedDeliverables).map(([category, items]) => (
                  <div key={category} className="deliverable-category">
                    <h4 className="category-title">{category}</h4>
                    <div className="deliverable-grid">
                      {items.map((opt) => {
                        const IconComponent = opt.icon
                        const isSelected = form.deliverables.includes(opt.key)
                        return (
                          <label key={opt.key} className={`deliverable-card ${isSelected ? "selected" : ""}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleDeliverableChange(opt.key)}
                            />
                            <div className="card-content">
                              <div className="card-header">
                                <IconComponent size={20} />
                                <div className="card-check">
                                  <CheckCircle2 size={16} />
                                </div>
                              </div>
                              <h5 className="card-title">{opt.label}</h5>
                              <p className="card-description">{opt.desc}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={18} />
                {loading ? "Creating Project..." : "Create Project"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default ProjectForm
