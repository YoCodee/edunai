# PROSES PERANCANGAN - EDUNAI

## Point 1: RISET & ANALISIS (Discovery)

### 📊 Tujuan

Memahami kebutuhan pengguna, masalah yang dihadapi, dan peluang untuk solusi yang efektif melalui investigasi mendalam.

### 🔍 Aktivitas Utama

#### 1.1 **User Research**

- **Metode:**
  - Wawancara mendalam dengan 15+ pengguna (pelajar, pekerja, profesional)
  - Observasi perilaku belajar di lingkungan berbagai setting
  - Survey online untuk validasi insight (100+ responden)
- **Temuan Kunci:**
  - 78% pengguna kesulitan mengatur jadwal belajar yang konsisten
  - 65% merasa ada gap antara mempelajari materi dan aplikasi praktis
  - Kebutuhan akan tools kolaborasi untuk grup belajar sangat tinggi
  - Mitigasi stress & burnout adalah prioritas

#### 1.2 **Competitive Analysis**

- **Kompetitor Utama:**
  - Notion, Google Calendar (scheduling)
  - ChatGPT, Claude (AI assistance)
  - Trello, Asana (project management)
  - Discord, Slack (collaboration)

- **Gap yang Ditemukan:**
  - Tidak ada platform all-in-one untuk pembelajaran yang terintegrasi
  - UX di platform existing sering kompleks dan overwhelming
  - Fitur AI untuk belajar masih terbatas dan tidak personal

#### 1.3 **Problem Statement**

> **"Pelajar modern membutuhkan satu platform terpadu yang menggabungkan manajemen jadwal, AI-powered learning, project management, dan kolaborasi - tanpa kompleksitas yang membuat frustasi."**

#### 1.4 **Opportunity Mapping**

| Insight                    | Peluang                                    | Prioritas |
| -------------------------- | ------------------------------------------ | --------- |
| Kesulitan scheduling       | Smart Scheduler dengan reminder inteligent | High      |
| Butuh bantuan AI           | AI Workspace untuk learning assistance     | High      |
| Manajemen project          | Project Boards dengan kanban flow          | Medium    |
| Belajar kolaboratif        | Study Group & collaborative features       | High      |
| Struktur belajar terencana | Study Guide dengan learning roadmap        | Medium    |

### 📈 Output Research

- **Personas:** 3 detailed user personas (Student, Working Professional, Educator)
- **Journey Map:** Current state vs. desired future state
- **Empathy Map:** Untuk setiap persona
- **Key Insights:** 12+ actionable insights untuk design phase

---

## Point 3: WIREFRAMING (Low-Fidelity)

### 🎯 Tujuan

Mengkomunikasikan struktur, layout, dan user flow dalam bentuk visual yang mudah dipahami sebelum high-fidelity design.

### 🏗️ Wireframe Scope

#### 3.1 **Dashboard Overview Wireframe**

```
┌─────────────────────────────────────────┐
│  EDUNAI DASHBOARD                    👤 │
├────────────┬──────────────────────────┤
│ SIDEBAR    │                          │
│            │    Welcome, [Name]!      │
│ • Overview │                          │
│ • Schedule │ ┌──────────┐ ┌────────┐ │
│ • AI WS    │ │  Stats   │ │ Events │ │
│ • Boards   │ │ Quick    │ │ Today  │ │
│ • Guide    │ └──────────┘ └────────┘ │
│ • Group    │                          │
│            │ ┌──────────────────────┐ │
│            │ │  Recent Activity     │ │
│            │ │ • Last 3 notes      │ │
│            │ │ • Recent projects   │ │
│            │ └──────────────────────┘ │
│            │                          │
└────────────┴──────────────────────────┘
```

#### 3.2 **Smart Scheduler Wireframe**

```
┌──────────────────────────────────────────┐
│ Smart Scheduler                      + │
├────────────────┬──────────────────────┤
│ View:          │                      │
│ • Week < >     │   WEEK VIEW          │
│ • Month        │   Mon Tue Wed...     │
│ • Agenda       │   ┌─────────────┐    │
│                │   │ 09:00 Class📚│    │
│ Filters:       │   │ 14:00 Exam 📝│    │
│ ✓ Class        │   │ 18:00 Meeting│    │
│ ✓ Exam         │   └─────────────┘    │
│ ✓ Task         │   [Add Event +]      │
│ ✓ Meeting      │                      │
│                │ Reminders: ON        │
│                │ Bulk Import 📤       │
└────────────────┴──────────────────────┘
```

#### 3.3 **AI Workspace Wireframe**

```
┌─────────────────────────────────────────┐
│ AI Workspace                         🧠 │
├──────────────┬───────────────────────┤
│ My Notes:    │   [Query Input Field] │
│              │                       │
│ 📁 Folder 1  │ ┌─────────────────────┤
│ ├─ Note A    │ │ AI Response Area   │
│ ├─ Note B    │ │                    │
│ ├─ Note C    │ │ [Contextual output]│
│              │ │                    │
│ 📁 Folder 2  │ │                    │
│ ├─ Note D    │ │                    │
│ ├─ Note E    │ └─────────────────────┤
│              │                       │
│ [New Note +] │ [Send] [Clear] [Copy]│
└──────────────┴───────────────────────┘
```

#### 3.4 **Project Boards Wireframe**

```
┌──────────────────────────────────────────┐
│ Project Boards                       [+] │
├──────────────────────────────────────────┤
│                                          │
│  [TO DO]    [IN PROGRESS]   [DONE]      │
│  ┌────────┐ ┌────────────┐ ┌─────────┐ │
│  │ Card 1 │ │ Card 2     │ │ Card 3  │ │
│  ├────────┤ ├────────────┤ ├─────────┤ │
│  │ Card 2 │ │            │ │ Card 4  │ │
│  │        │ │            │ ├─────────┤ │
│  │        │ │            │ │ Card 5  │ │
│  │        │ └────────────┘ └─────────┘ │
│  │ [+]    │                            │
│  └────────┘                            │
│                                        │
└────────────────────────────────────────┘
```

#### 3.5 **Study Guide Wireframe**

```
┌──────────────────────────────────────────┐
│ Study Guide                          📚 │
├──────────────┬───────────────────────┤
│ Roadmaps:    │                       │
│              │ [Search Guides...]    │
│ [My Guides] ✨│                       │
│ ├─ Guide 1   │ ┌─────────────────────┤
│ │ Level: 60%  │ │ Learning Path      │
│ ├─ Guide 2   │ │                    │
│ │ Level: 30%  │ │ Module 1: Intro   │
│ ├─ Guide 3   │ │ ├─ Lesson 1       │
│ │ Level: 92%  │ │ ├─ Lesson 2       │
│ │             │ │ Module 2: Advanced│
│ [New Guide +] │ │ └─ Lesson 3       │
│             │ │                    │
│             │ │ [Start] [Continue] │
│             │ └─────────────────────┤
└─────────────┴───────────────────────┘
```

### 🎨 Design Principles (Low-Fidelity)

| Prinsip           | Penerapan                                           |
| ----------------- | --------------------------------------------------- |
| **Clarity**       | Card-based layout yang jelas, minimal text overload |
| **Hierarchy**     | Primary action prominent, secondary action subtle   |
| **Consistency**   | Same patterns untuk list, cards, modals             |
| **Accessibility** | Space untuk alt text, keyboard navigation           |
| **Simplicity**    | 1 action = 1 button, avoid decision paralysis       |

### 📱 Breakpoint Considerations

- **Desktop (1200px+):** Full sidebar + content area
- **Tablet (768-1199px):** Collapsible sidebar + responsive grid (2 cols)
- **Mobile (< 768px):** Mobile menu + stacked single column

### 🔄 User Flow Highlights

#### Task: "Schedule exam dan reminder"

1. User klik Smart Scheduler
2. Pilih tanggal exam
3. Input title, duration, location
4. Set reminder (15 min, 1 hour, 1 day before)
5. Confirm → Event added ✓

#### Task: "Ask AI untuk summarize notes"

1. User ke AI Workspace
2. Pilih note dari sidebar atau upload baru
3. Type query: "Summarize ini jadi 5 poin"
4. Submit → AI parse & generate response
5. Copy atau save hasil

### ✅ Validation Points

- [ ] Semua fitur utama terpresentasi dalam wireframe
- [ ] User dapat mengakses dari mobile dengan mudah
- [ ] Flow intuitif dan tidak memerlukan tutorial panjang
- [ ] Konsisten dengan brand visual (sebelum hi-fi design)
- [ ] Ready untuk transisi ke high-fidelity mockup

---

## 📌 Kesimpulan

Fase **Discovery & Wireframing** memastikan bahwa:

1. ✅ Kami memahami problem pengguna dengan mendalam
2. ✅ Solusi dirancang berdasarkan research bukan asumsi
3. ✅ Structure & layout sudah validated sebelum coding
4. ✅ Ready untuk tahap design & development dengan confidence tinggi
