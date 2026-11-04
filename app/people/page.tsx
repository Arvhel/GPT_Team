"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import "./people.css";

type EmployeeStatus = "Full time" | "Part time" | "On leave";
type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  status: EmployeeStatus;
  startDate: string;
  color: string;
};
type Department = { id: number; name: string; lead: string; location: string; color: string };
type EmployeeDraft = Omit<Employee, "id" | "color">;
type PeopleView = "overview" | "employees" | "departments";
type EmployeeModal = "add" | "edit" | null;

const initialDepartments: Department[] = [
  { id: 1, name: "Design", lead: "Maya Chen", location: "Brooklyn, NY", color: "lilac" },
  { id: 2, name: "Engineering", lead: "Theo Brooks", location: "Remote", color: "sage" },
  { id: 3, name: "People & culture", lead: "Jordan Lee", location: "Brooklyn, NY", color: "peach" },
  { id: 4, name: "Marketing", lead: "Sam Rivera", location: "Austin, TX", color: "butter" },
];

const initialEmployees: Employee[] = [
  { id: 1, name: "Maya Chen", email: "maya@hope.studio", role: "Design lead", department: "Design", location: "Brooklyn, NY", status: "Full time", startDate: "2022-03-14", color: "lilac" },
  { id: 2, name: "Theo Brooks", email: "theo@hope.studio", role: "Senior engineer", department: "Engineering", location: "Remote", status: "Full time", startDate: "2021-08-02", color: "sage" },
  { id: 3, name: "Jordan Lee", email: "jordan@hope.studio", role: "People partner", department: "People & culture", location: "Brooklyn, NY", status: "Full time", startDate: "2023-01-09", color: "peach" },
  { id: 4, name: "Sam Rivera", email: "sam@hope.studio", role: "Brand designer", department: "Design", location: "Austin, TX", status: "Part time", startDate: "2024-05-20", color: "butter" },
  { id: 5, name: "Alex Morgan", email: "alex@hope.studio", role: "Product manager", department: "Engineering", location: "Remote", status: "Full time", startDate: "2022-11-07", color: "blue" },
  { id: 6, name: "Nina Patel", email: "nina@hope.studio", role: "Marketing manager", department: "Marketing", location: "Austin, TX", status: "On leave", startDate: "2023-07-17", color: "rose" },
  { id: 7, name: "Owen Park", email: "owen@hope.studio", role: "Frontend engineer", department: "Engineering", location: "Remote", status: "Full time", startDate: "2024-02-05", color: "mint" },
];

const avatarColors = ["lilac", "sage", "peach", "butter", "blue", "rose", "mint"];

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.5" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 2.5 4.5V20" /></>,
    chart: <><path d="M4 20V11M10 20V5M16 20v-7M22 20H2" /><path d="m3 8 6-4 6 6 6-5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    down: <path d="m7 10 5 5 5-5" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    leaf: <><path d="M20 4C10 4 5 7.5 5 14a6 6 0 0 0 6 6c6.5 0 9-6 9-16Z" /><path d="M4 21c2-5 5-8 11-11" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    heart: <path d="M20.8 8.8c0 4.2-8.8 10-8.8 10S3.2 13 3.2 8.8A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8.8 1.8Z" />,
    dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  };
  return <svg aria-hidden="true" className="people-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.spark}</svg>;
}

function Initials({ name, color, size = "" }: { name: string; color: string; size?: string }) {
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <span className={`people-avatar avatar-${color} ${size ? `avatar-${size}` : ""}`} aria-hidden="true">{initials}</span>;
}

function EmployeeForm({ employee, departments, onClose, onSave }: {
  employee: Employee | null;
  departments: Department[];
  onClose: () => void;
  onSave: (draft: EmployeeDraft) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      role: String(data.get("role")).trim(),
      department: String(data.get("department")),
      location: String(data.get("location")).trim(),
      status: String(data.get("status")) as EmployeeStatus,
      startDate: String(data.get("startDate")),
    });
  }
  return (
    <div className="people-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="people-modal" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
        <button className="people-modal-close" type="button" onClick={onClose} aria-label="Close form"><Icon name="close" /></button>
        <span className="people-eyebrow">{employee ? "A LITTLE PROFILE TUNE-UP" : "SOMEONE NEW, GOOD THINGS AHEAD"}</span>
        <h2 id="employee-form-title">{employee ? "Edit teammate" : "Welcome someone in"}</h2>
        <p>Keep the people details in one thoughtful place.</p>
        <form className="people-form" onSubmit={submit}>
          <div className="people-form-row">
            <label>Full name<input name="name" placeholder="e.g. Maya Chen" defaultValue={employee?.name} required maxLength={70} /></label>
            <label>Work email<input name="email" type="email" placeholder="name@hope.studio" defaultValue={employee?.email} required maxLength={120} /></label>
          </div>
          <label>Role or title<input name="role" placeholder="e.g. Design lead" defaultValue={employee?.role} required maxLength={80} /></label>
          <div className="people-form-row">
            <label>Department<select name="department" defaultValue={employee?.department ?? departments[0]?.name} required>{departments.map((department) => <option key={department.id}>{department.name}</option>)}</select></label>
            <label>Work location<input name="location" placeholder="e.g. Brooklyn, NY" defaultValue={employee?.location} required maxLength={70} /></label>
          </div>
          <div className="people-form-row">
            <label>Employment status<select name="status" defaultValue={employee?.status ?? "Full time"}><option>Full time</option><option>Part time</option><option>On leave</option></select></label>
            <label>Start date<input name="startDate" type="date" defaultValue={employee?.startDate ?? new Date().toISOString().slice(0, 10)} required /></label>
          </div>
          <div className="people-form-actions"><button type="button" className="people-button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="people-button-primary">{employee ? "Save changes" : "Add teammate"}<Icon name="arrow" /></button></div>
        </form>
      </section>
    </div>
  );
}

function DepartmentForm({ department, onClose, onSave }: {
  department: Department | null;
  onClose: () => void;
  onSave: (draft: Omit<Department, "id" | "color">) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({ name: String(data.get("name")).trim(), lead: String(data.get("lead")).trim(), location: String(data.get("location")).trim() });
  }
  return (
    <div className="people-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="people-modal people-department-modal" role="dialog" aria-modal="true" aria-labelledby="department-form-title">
        <button className="people-modal-close" type="button" onClick={onClose} aria-label="Close form"><Icon name="close" /></button>
        <span className="people-eyebrow">MAKE ROOM FOR GOOD WORK</span>
        <h2 id="department-form-title">{department ? "Edit department" : "A new corner of the team"}</h2>
        <p>Give this group a name, a lead, and a place to call home.</p>
        <form className="people-form" onSubmit={submit}>
          <label>Department name<input name="name" placeholder="e.g. Customer success" defaultValue={department?.name} required maxLength={60} /></label>
          <label>Department lead<input name="lead" placeholder="e.g. Jordan Lee" defaultValue={department?.lead} required maxLength={70} /></label>
          <label>Primary location<input name="location" placeholder="e.g. Brooklyn, NY or Remote" defaultValue={department?.location} required maxLength={70} /></label>
          <div className="people-form-actions"><button type="button" className="people-button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="people-button-primary">{department ? "Save department" : "Create department"}<Icon name="arrow" /></button></div>
        </form>
      </section>
    </div>
  );
}

function EmployeeProfile({ employee, onClose, onEdit }: { employee: Employee; onClose: () => void; onEdit: () => void }) {
  const started = new Date(`${employee.startDate}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return (
    <div className="people-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="people-modal people-profile-modal" role="dialog" aria-modal="true" aria-labelledby="employee-profile-title">
        <button className="people-modal-close" type="button" onClick={onClose} aria-label="Close profile"><Icon name="close" /></button>
        <div className="profile-cover"><span>GOOD WORK, GROWING TOGETHER</span><i>✳</i></div>
        <div className="profile-identity"><Initials name={employee.name} color={employee.color} size="large" /><span className={`people-status status-${employee.status.toLowerCase().replace(" ", "-")}`}><i />{employee.status}</span></div>
        <h2 id="employee-profile-title">{employee.name}</h2>
        <p className="profile-role">{employee.role} <span>·</span> {employee.department}</p>
        <a className="profile-email" href={`mailto:${employee.email}`}><Icon name="mail" />{employee.email}</a>
        <div className="profile-details-grid">
          <span><i><Icon name="pin" /></i><small>LOCATION</small><b>{employee.location}</b></span>
          <span><i><Icon name="calendar" /></i><small>STARTED HERE</small><b>{started}</b></span>
          <span><i><Icon name="people" /></i><small>TEAM</small><b>{employee.department}</b></span>
          <span><i><Icon name="spark" /></i><small>WORK STYLE</small><b>{employee.status}</b></span>
        </div>
        <button className="people-button-primary profile-edit-button" type="button" onClick={onEdit}>Edit teammate<Icon name="arrow" /></button>
      </section>
    </div>
  );
}

export default function PeoplePage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [departments, setDepartments] = useState(initialDepartments);
  const [view, setView] = useState<PeopleView>("overview");
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [employeeModal, setEmployeeModal] = useState<EmployeeModal>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [departmentModal, setDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [notice, setNotice] = useState("");

  const visibleEmployees = useMemo(() => employees.filter((employee) => {
    const matchesQuery = `${employee.name} ${employee.email} ${employee.role}`.toLowerCase().includes(query.toLowerCase());
    const matchesDepartment = departmentFilter === "All departments" || employee.department === departmentFilter;
    const matchesStatus = statusFilter === "All statuses" || employee.status === statusFilter;
    return matchesQuery && matchesDepartment && matchesStatus;
  }), [employees, query, departmentFilter, statusFilter]);
  const activeCount = employees.filter((employee) => employee.status !== "On leave").length;
  const remoteCount = employees.filter((employee) => employee.location.toLowerCase() === "remote").length;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }
  function saveEmployee(draft: EmployeeDraft) {
    if (editingEmployee) {
      setEmployees((current) => current.map((employee) => employee.id === editingEmployee.id ? { ...employee, ...draft } : employee));
      setSelectedEmployee(null);
      showNotice(`${draft.name}'s profile has been updated.`);
    } else {
      const newEmployee = { ...draft, id: Math.max(0, ...employees.map((employee) => employee.id)) + 1, color: avatarColors[employees.length % avatarColors.length] };
      setEmployees((current) => [newEmployee, ...current]);
      showNotice(`${draft.name} has been added to the team.`);
    }
    setEmployeeModal(null);
    setEditingEmployee(null);
  }
  function saveDepartment(draft: Omit<Department, "id" | "color">) {
    if (editingDepartment) {
      setDepartments((current) => current.map((department) => department.id === editingDepartment.id ? { ...department, ...draft } : department));
      if (editingDepartment.name !== draft.name) {
        setEmployees((current) => current.map((employee) => employee.department === editingDepartment.name ? { ...employee, department: draft.name } : employee));
        setDepartmentFilter((current) => current === editingDepartment.name ? draft.name : current);
      }
      showNotice(`${draft.name} has been updated.`);
    } else {
      setDepartments((current) => [...current, { ...draft, id: Math.max(0, ...current.map((department) => department.id)) + 1, color: avatarColors[current.length % avatarColors.length] }]);
      showNotice(`${draft.name} is ready for its team.`);
    }
    setDepartmentModal(false);
    setEditingDepartment(null);
  }

  const views: { id: PeopleView; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "employees", label: "People" },
    { id: "departments", label: "Departments" },
  ];

  return (
    <main className="people-app">
      <aside className="people-sidebar">
        <a className="people-brand" href="/" aria-label="Hope home"><span className="people-brand-mark"><Icon name="leaf" /></span><span>hope<span>, inc.</span></span></a>
        <div className="people-workspace"><span className="people-workspace-avatar">H</span><span><b>Hope Studio</b><small>Workspace</small></span><Icon name="down" /></div>
        <span className="people-sidebar-label">YOUR WORKSPACE</span>
        <nav className="people-nav" aria-label="Workspace navigation">
          <a href="/dashboard"><Icon name="grid" />Overview</a>
          <a href="/products"><Icon name="box" />Products</a>
          <a className="active" href="/people" aria-current="page"><Icon name="people" />People<span className="people-nav-count">{employees.length}</span></a>
          <a href="/customers"><Icon name="chart" />Sales</a>
          <a href="/customers"><Icon name="spark" />Customer management</a>
        </nav>
        <div className="people-sidebar-bottom">
          <div className="people-sidebar-note"><span>✳</span><b>People make it happen.</b><p>A healthier team starts with a little more clarity.</p></div>
          <a href="/" className="people-sidebar-back">← <span>Back to Hope home</span></a>
          <div className="people-sidebar-profile"><Initials name="Alex Morgan" color="blue" /><span><b>Alex Morgan</b><small>Workspace owner</small></span><span className="people-profile-dots">···</span></div>
        </div>
      </aside>

      <section className="people-main">
        <header className="people-topbar">
          <div className="people-breadcrumb"><span>Workspace</span><i>/</i><b>People & culture</b></div>
          <div className="people-topbar-right"><span className="people-topbar-date">TUESDAY, NOVEMBER 5</span><Initials name="Alex Morgan" color="blue" size="small" /></div>
        </header>
        <div className="people-content">
          <div className="people-welcome">
            <div><span className="people-eyebrow">A THOUGHTFUL VIEW OF YOUR TEAM</span><h1>People & culture<span>.</span></h1><p>Take care of the people who make the good work happen.</p></div>
            <div className="people-welcome-actions"><span className="team-together-note"><Icon name="heart" />Made for people, always</span><button className="people-button-primary" type="button" onClick={() => { setEditingEmployee(null); setEmployeeModal("add"); }}><Icon name="plus" />Add teammate</button></div>
          </div>

          <nav className="people-view-tabs" aria-label="People workspace pages">
            {views.map((item) => <button key={item.id} type="button" className={view === item.id ? "selected" : ""} onClick={() => setView(item.id)} aria-current={view === item.id ? "page" : undefined}>{item.label}{item.id === "employees" && <span>{employees.length}</span>}</button>)}
            <span className="people-tab-caption">A little more in sync <i>✳</i></span>
          </nav>

          {view === "overview" && (
            <>
              <section className="people-stats" aria-label="Team overview">
                <article className="people-stat-card people-stat-headcount"><div><span>OUR PEOPLE</span><i><Icon name="people" /></i></div><strong>{employees.length.toString().padStart(2, "0")}</strong><small>Good humans, one team</small><span className="stat-decoration">P</span></article>
                <article className="people-stat-card"><div><span>HERE & GROWING</span><i><Icon name="spark" /></i></div><strong>{activeCount.toString().padStart(2, "0")}</strong><small><i className="stat-dot stat-dot-green" />Active teammates</small></article>
                <article className="people-stat-card"><div><span>OUR LITTLE CORNERS</span><i><Icon name="grid" /></i></div><strong>{departments.length.toString().padStart(2, "0")}</strong><small>Connected departments</small></article>
                <article className="people-stat-card people-stat-remote"><div><span>WORKING FROM EVERYWHERE</span><i><Icon name="pin" /></i></div><strong>{remoteCount.toString().padStart(2, "0")}</strong><small>Remote teammates</small><span className="remote-orbit" aria-hidden="true">⌁</span></article>
              </section>

              <div className="people-overview-grid">
                <section className="people-team-panel" aria-labelledby="team-panel-title">
                  <div className="people-panel-heading"><div><span className="people-eyebrow">THE PEOPLE BEHIND THE GOOD WORK</span><h2 id="team-panel-title">Meet the team <span>{employees.length}</span></h2></div><button type="button" className="people-text-link" onClick={() => setView("employees")}>Everyone <Icon name="arrow" /></button></div>
                  <div className="people-mini-list">{employees.slice(0, 5).map((employee) => <button className="people-mini-row" type="button" key={employee.id} onClick={() => setSelectedEmployee(employee)}><Initials name={employee.name} color={employee.color} /><span className="people-mini-identity"><b>{employee.name}</b><small>{employee.role}</small></span><span className="people-mini-department">{employee.department}</span><span className={`people-presence ${employee.status === "On leave" ? "presence-away" : ""}`} title={employee.status} /></button>)}</div>
                  <button className="people-view-everyone" type="button" onClick={() => setView("employees")}>A closer look at everyone <Icon name="arrow" /></button>
                </section>

                <aside className="people-side-stack">
                  <section className="people-note-card">
                    <span className="people-note-eyebrow">A MOMENT TO NOTICE</span><i className="people-note-flower">✳</i>
                    <h2>Good work<br /><em>grows together.</em></h2>
                    <p>Every point of view makes this team a little stronger.</p>
                    <div className="people-note-avatars">{employees.slice(0, 5).map((employee) => <Initials key={employee.id} name={employee.name} color={employee.color} />)}<span>+{Math.max(0, employees.length - 5)}</span></div>
                    <span className="people-note-footer">ONE TEAM, MANY GOOD IDEAS</span>
                  </section>
                  <section className="people-upcoming-card"><div className="people-upcoming-icon"><Icon name="calendar" /></div><div><span className="people-eyebrow">COMING UP NEXT</span><h3>Team check-in</h3><p><Icon name="clock" /> Thursday, 10:30 am <span>·</span> Studio room</p></div><button type="button" aria-label="View all team events" onClick={() => showNotice("You’re all caught up on team moments.")}><Icon name="arrow" /></button></section>
                </aside>
              </div>

              <section className="people-department-strip">
                <div className="people-department-strip-heading"><div><span className="people-eyebrow">GOOD WORK, DIFFERENT CORNERS</span><h2>Our departments</h2></div><button type="button" className="people-text-link" onClick={() => setView("departments")}>Explore teams <Icon name="arrow" /></button></div>
                <div className="people-department-chips">{departments.map((department) => <button key={department.id} type="button" className="people-department-chip" onClick={() => { setDepartmentFilter(department.name); setView("employees"); }}><span className={`department-chip-icon chip-${department.color}`}><Icon name="spark" /></span><span><b>{department.name}</b><small>{employees.filter((employee) => employee.department === department.name).length} teammates</small></span><Icon name="arrow" /></button>)}</div>
              </section>
            </>
          )}

          {view === "employees" && (
            <section className="people-directory" aria-labelledby="directory-title">
              <div className="people-panel-heading directory-heading"><div><span className="people-eyebrow">EVERY PERSON, RIGHT WHERE THEY BELONG</span><h2 id="directory-title">The team directory <span>{visibleEmployees.length}</span></h2></div><button type="button" className="people-button-secondary" onClick={() => { setEditingEmployee(null); setEmployeeModal("add"); }}><Icon name="plus" />Add teammate</button></div>
              <div className="people-directory-toolbar">
                <label className="people-search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a teammate, role, or email" aria-label="Search teammates" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" /></button>}</label>
                <label className="people-filter"><span className="sr-only">Filter by department</span><select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}><option>All departments</option>{departments.map((department) => <option key={department.id}>{department.name}</option>)}</select><Icon name="down" /></label>
                <label className="people-filter"><span className="sr-only">Filter by employment status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option><option>Full time</option><option>Part time</option><option>On leave</option></select><Icon name="down" /></label>
              </div>
              <div className="people-directory-table-wrap">
                {visibleEmployees.length === 0 ? <div className="people-empty"><span><Icon name="people" /></span><h3>No one by that name just yet.</h3><p>Try a different search or clear your filters.</p><button className="people-button-secondary" type="button" onClick={() => { setQuery(""); setDepartmentFilter("All departments"); setStatusFilter("All statuses"); }}>Clear filters</button></div> : (
                  <table className="people-table"><thead><tr><th scope="col">TEAMMATE</th><th scope="col">ROLE</th><th scope="col">DEPARTMENT</th><th scope="col">LOCATION</th><th scope="col">STATUS</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>{visibleEmployees.map((employee) => <tr key={employee.id}>
                      <td><button className="people-table-person" type="button" onClick={() => setSelectedEmployee(employee)}><Initials name={employee.name} color={employee.color} /><span><b>{employee.name}</b><small>{employee.email}</small></span></button></td>
                      <td>{employee.role}</td><td><span className="people-table-department">{employee.department}</span></td><td><span className="people-location"><Icon name="pin" />{employee.location}</span></td>
                      <td><span className={`people-status status-${employee.status.toLowerCase().replace(" ", "-")}`}><i />{employee.status}</span></td>
                      <td><button className="people-row-action" type="button" aria-label={`Edit ${employee.name}`} onClick={() => { setEditingEmployee(employee); setEmployeeModal("edit"); }}><Icon name="dots" /></button></td>
                    </tr>)}</tbody>
                  </table>
                )}
              </div>
              {visibleEmployees.length > 0 && <div className="people-table-foot"><span>Showing <b>{visibleEmployees.length}</b> of <b>{employees.length}</b> teammates</span><span>Good people, doing good things <i>✳</i></span></div>}
            </section>
          )}

          {view === "departments" && (
            <section className="people-departments-view">
              <div className="people-panel-heading directory-heading"><div><span className="people-eyebrow">SMALL TEAMS, BIG-HEARTED WORK</span><h2>Where the good work happens <span>{departments.length}</span></h2></div><button type="button" className="people-button-primary" onClick={() => { setEditingDepartment(null); setDepartmentModal(true); }}><Icon name="plus" />Add department</button></div>
              <p className="departments-intro">Every department brings its own point of view. Together, they make the whole thing work.</p>
              <div className="people-department-cards">{departments.map((department) => {
                const members = employees.filter((employee) => employee.department === department.name);
                const lead = employees.find((employee) => employee.name === department.lead);
                return <article className={`people-department-card department-${department.color}`} key={department.id}>
                  <div className="department-card-head"><span className={`department-icon icon-${department.color}`}><Icon name="spark" /></span><button className="people-row-action" type="button" aria-label={`Edit ${department.name}`} onClick={() => { setEditingDepartment(department); setDepartmentModal(true); }}><Icon name="dots" /></button></div>
                  <span className="people-eyebrow">DEPARTMENT {String(department.id).padStart(2, "0")}</span><h3>{department.name}</h3>
                  <p className="department-location"><Icon name="pin" />{department.location}</p>
                  <div className="department-card-foot"><div className="department-avatars">{members.slice(0, 4).map((employee) => <Initials key={employee.id} name={employee.name} color={employee.color} />)}{members.length > 4 && <span>+{members.length - 4}</span>}</div><span>{members.length} {members.length === 1 ? "teammate" : "teammates"}</span></div>
                  <div className="department-lead"><span>TEAM LEAD</span><b>{lead?.name ?? department.lead}</b></div>
                  <button className="department-open-button" type="button" onClick={() => { setDepartmentFilter(department.name); setView("employees"); }}>Meet this team <Icon name="arrow" /></button>
                </article>;
              })}</div>
              <div className="people-department-footnote"><Icon name="heart" /><span>Good teams are built on good conversations. Make space for one this week.</span></div>
            </section>
          )}

          <footer className="people-footer"><span>HOPE, INC. &nbsp;·&nbsp; MADE FOR THE WAY TEAMS REALLY WORK</span><a href="/">A little more in sync <Icon name="leaf" /></a></footer>
        </div>
      </section>
      {notice && <div className="people-toast" role="status"><span>✓</span>{notice}</div>}
      {employeeModal && <EmployeeForm employee={editingEmployee} departments={departments} onClose={() => { setEmployeeModal(null); setEditingEmployee(null); }} onSave={saveEmployee} />}
      {departmentModal && <DepartmentForm department={editingDepartment} onClose={() => { setDepartmentModal(false); setEditingDepartment(null); }} onSave={saveDepartment} />}
      {selectedEmployee && <EmployeeProfile employee={employees.find((employee) => employee.id === selectedEmployee.id) ?? selectedEmployee} onClose={() => setSelectedEmployee(null)} onEdit={() => { setEditingEmployee(selectedEmployee); setSelectedEmployee(null); setEmployeeModal("edit"); }} />}
    </main>
  );
}
