import { useEffect, useState, type ReactNode } from "react";
import { Archive, Check, Plus, RefreshCw, UserCheck, Users, FolderKanban, Building2, Trash2, Code2, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
    approveUser,
    assignDepartment,
    assignProjectMember,
    archiveProjectAdmin,
    deleteProjectAdmin,
    createDepartment,
    createProjectAdmin,
    deactivateUser,
    getDepartments,
    getOrganizationAdmin,
    getPendingUsers,
    getProjectMembers,
    getProjectsAdmin,
    getUsers,
    rejectUser,
    removeProjectMember,
    updateOrganizationAdmin,
} from "../../services/api/admin";
import {
    createCodeRepository,
    indexCodeRepository,
    listCodeRepositories,
    validateCodeRepository,
} from "../../services/api/codemind";

interface Member { id: number; project_id: number; user_id: number; permission: string; created_at: string; updated_at: string; }

export default function AdminCenter() {
    const { user } = useAuth();
    const [tab, setTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [repositories, setRepositories] = useState<any[]>([]);
    const [org, setOrg] = useState<any>(null);
    const [newDept, setNewDept] = useState("");
    const [newProject, setNewProject] = useState("");
    const [repoForm, setRepoForm] = useState({ projectId: "", name: "", provider: "local" as "local" | "github", localPath: "", remoteUrl: "", branch: "main" });
    const [members, setMembers] = useState<Record<number, Member[]>>({});
    const [loadingMembers, setLoadingMembers] = useState<number | null>(null);
    const [indexing, setIndexing] = useState(false);

    const load = async () => {
        if (!user) return;
        setLoading(true); setError("");
        try {
            const [u, p, d, pr, o, r] = await Promise.all([
                getUsers(),
                getPendingUsers(),
                getDepartments(),
                getProjectsAdmin(),
                getOrganizationAdmin(user.organization_id),
                listCodeRepositories(),
            ]);
            setUsers(u); setPending(p); setDepartments(d); setProjects(pr); setOrg(o); setRepositories(r);
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Unable to load admin data");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [user?.organization_id]);

    const run = async (fn: () => Promise<any>, success = "Done") => {
        try { setError(""); await fn(); setMessage(success); await load(); }
        catch (e: any) { setError(e?.response?.data?.detail || e.message || "Operation failed"); }
    };

    const toggleMembers = async (projectId: number) => {
        if (members[projectId]) {
            setMembers(current => { const next = { ...current }; delete next[projectId]; return next; });
            return;
        }
        setLoadingMembers(projectId); setError("");
        try {
            const data = await getProjectMembers(projectId);
            setMembers(current => ({ ...current, [projectId]: data }));
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Unable to load project members");
        }
        finally { setLoadingMembers(null); }
    };

    const submitRepository = async () => {
        if (!repoForm.projectId || !repoForm.name.trim()) {
            setError("Select a project and enter a repository name."); return;
        }
        setIndexing(true); setError(""); setMessage("");
        try {
            const repo = await createCodeRepository({
                project_id: Number(repoForm.projectId),
                name: repoForm.name.trim(),
                provider: repoForm.provider,
                local_path: repoForm.provider === "local" ? repoForm.localPath.trim() || null : null,
                remote_url: repoForm.provider === "github" ? repoForm.remoteUrl.trim() || null : null,
                default_branch: repoForm.branch.trim() || "main",
            } as any);
            const validation = await validateCodeRepository(repo.id);
            if (!validation.valid) throw new Error(validation.error || "Repository validation failed");
            await indexCodeRepository(repo.id);
            setMessage(`CodeMind indexed ${repoForm.name} successfully.`);
            setRepositories(await listCodeRepositories());
        } catch (e: any) {
            setError(e?.response?.data?.detail || e.message || "CodeMind indexing failed");
        } finally { setIndexing(false); }
    };

    if (loading) return <div className="p-8">Loading admin center...</div>;

    return <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
                    <ShieldCheck size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Enterprise Admin Center</h1>
                    <p className="text-xs text-slate-500">Manage organization tenancy, user authorization, RBAC roles, and CodeMind AST indexing.</p>
                </div>
            </div>
            <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95"><RefreshCw size={14}/>Refresh</button>
        </div>
        {(error || message) && <div className={`rounded-xl border p-4 text-xs font-semibold shadow-xs ${error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</div>}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 bg-white rounded-t-xl p-2">
            {["overview","requests","employees","departments","projects","organization","codemind"].map(x => <button key={x} onClick={() => setTab(x)} className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${tab===x?"bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs":"text-slate-600 hover:bg-slate-100"}`}>{x[0].toUpperCase()+x.slice(1)}</button>)}
        </div>

        {tab === "overview" && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Stat label="Employees" value={users.filter(u => u.role === "employee").length} icon={<Users size={18} className="text-indigo-600"/>}/>
            <Stat label="Pending Requests" value={pending.length} icon={<UserCheck size={18} className="text-amber-600"/>}/>
            <Stat label="Departments" value={departments.length} icon={<Building2 size={18} className="text-violet-600"/>}/>
            <Stat label="Active Projects" value={projects.filter(p=>p.status === "active").length} icon={<FolderKanban size={18} className="text-emerald-600"/>}/>
        </div>}

        {tab === "requests" && <Section title="Pending registration requests"><div className="space-y-3">{pending.length===0 ? <Empty/> : pending.map(u => <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4"><div><div className="text-xs font-bold text-slate-900">{u.name}</div><div className="text-xs text-slate-500 font-mono">{u.email}</div></div><div className="flex gap-2"><button onClick={()=>run(()=>approveUser(u.id),"Employee approved")} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition"><Check size={14}/>Approve</button><button onClick={()=>run(()=>rejectUser(u.id),"Employee rejected")} className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">Reject</button></div></div>)}</div></Section>}

        {tab === "employees" && <Section title="Employees Directory"><div className="overflow-auto"><table className="min-w-full text-xs"><thead><tr className="border-b border-slate-100 text-left text-slate-400 font-semibold"><th className="pb-3 px-2">Name</th><th className="pb-3 px-2">Email</th><th className="pb-3 px-2">Clearance</th><th className="pb-3 px-2">Department</th><th className="pb-3 px-2">Actions</th></tr></thead><tbody>{users.filter(u=>u.role==="employee").map(u=><tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50"><td className="py-3 px-2 font-bold text-slate-900">{u.name}</td><td className="py-3 px-2 font-mono text-slate-600">{u.email}</td><td className="py-3 px-2"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold">{u.approval_status}</span></td><td className="py-3 px-2"><select value={u.department_id ?? ""} onChange={e=>run(()=>assignDepartment(u.id,e.target.value?Number(e.target.value):null))} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"><option value="">Unassigned</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></td><td className="py-3 px-2"><button onClick={()=>run(()=>deactivateUser(u.id),"Employee deactivated")} disabled={!u.is_active} className="rounded-lg border border-rose-200 px-2.5 py-1 text-rose-700 hover:bg-rose-50 disabled:opacity-40">Deactivate</button></td></tr>)}</tbody></table></div></Section>}

        {tab === "departments" && <Section title="Departments"><div className="mb-4 flex gap-2"><input value={newDept} onChange={e=>setNewDept(e.target.value)} placeholder="New department name..." className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:bg-white focus:outline-none"/><button onClick={()=>newDept.trim()&&run(async()=>{await createDepartment({name:newDept.trim()});setNewDept("");},"Department created")} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"><Plus size={14}/>Add</button></div><div className="grid gap-3 md:grid-cols-2">{departments.map(d=><div key={d.id} className="rounded-xl border border-slate-100 bg-slate-50/40 p-4"><div className="text-xs font-bold text-slate-900">{d.name}</div><div className="mt-0.5 text-xs text-slate-500">{d.description || "Active department unit"}</div></div>)}</div></Section>}

        {tab === "projects" && <Section title="Projects & Team Scopes">
            <div className="mb-4 flex gap-2">
                <input value={newProject} onChange={e=>setNewProject(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newProject.trim()){e.preventDefault();(document.getElementById("create-proj-btn") as HTMLElement)?.click();}}} placeholder="New project name..." className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:bg-white focus:outline-none"/>
                <button id="create-proj-btn" onClick={()=>newProject.trim()&&run(async()=>{
                    const slug=newProject.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-");
                    const created = await createProjectAdmin({name:newProject.trim(),slug});
                    setNewProject("");
                    setProjects(prev => [...prev, created]);
                },"Project created")} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"><Plus size={14}/>Create</button>
            </div>
            <div className="space-y-4">
                {projects.map(p=><ProjectCard key={p.id} project={p} users={users} members={members[p.id]} membersLoading={loadingMembers===p.id} onToggleMembers={()=>toggleMembers(p.id)} onAssign={(uid)=>run(()=>assignProjectMember(p.id,uid),"Member assigned")} onRemove={(uid)=>run(()=>removeProjectMember(p.id,uid),"Member removed")} onArchive={()=>run(async()=>{await archiveProjectAdmin(p.id);setProjects(prev=>prev.map(item=>item.id===p.id?{...item,status:"archived"}:item));},"Project archived")} onDelete={()=>run(async()=>{await deleteProjectAdmin(p.id);setProjects(prev=>prev.filter(item=>item.id!==p.id));},"Project deleted")}/>)}
            </div>
        </Section>}

        {tab === "organization" && <Section title="Organization Settings"><div className="grid gap-4 md:grid-cols-2"><label className="text-xs font-bold text-slate-700">Name<input value={org?.name || ""} onChange={e=>setOrg({...org,name:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:bg-white focus:outline-none"/></label><label className="text-xs font-bold text-slate-700">Slug<input value={org?.slug || ""} disabled className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-xs text-slate-500"/></label><label className="text-xs font-bold text-slate-700 md:col-span-2">Description<textarea value={org?.description || ""} onChange={e=>setOrg({...org,description:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs focus:bg-white focus:outline-none" rows={4}/></label></div><button onClick={()=>run(()=>updateOrganizationAdmin(org.id,{name:org.name,description:org.description}),"Organization updated")} className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition">Save organization</button></Section>}

        {tab === "codemind" && <Section title="CodeMind AST Repositories"><p className="text-xs text-slate-500 mb-4">Register repository targets for project-scoped AST call-graph indexing and CodeMind semantic reasoning.</p><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"><label className="text-xs font-bold text-slate-700">Project<select value={repoForm.projectId} onChange={e=>setRepoForm({...repoForm,projectId:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500"><option value="">Select project</option>{projects.filter(p=>p.status==="active").map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="text-xs font-bold text-slate-700">Repository name<input value={repoForm.name} onChange={e=>setRepoForm({...repoForm,name:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500" placeholder="PayFlow Codebase"/></label><label className="text-xs font-bold text-slate-700">Provider<select value={repoForm.provider} onChange={e=>setRepoForm({...repoForm,provider:e.target.value as "local"|"github"})} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500"><option value="local">Local</option><option value="github">GitHub</option></select></label>{repoForm.provider==="local"?<label className="text-xs font-bold text-slate-700 md:col-span-2">Local path<input value={repoForm.localPath} onChange={e=>setRepoForm({...repoForm,localPath:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs focus:border-indigo-500" placeholder="..\\datasets\\technova\\payflow"/></label>:<label className="text-xs font-bold text-slate-700 md:col-span-2">Remote URL<input value={repoForm.remoteUrl} onChange={e=>setRepoForm({...repoForm,remoteUrl:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500" placeholder="https://github.com/org/repo.git"/></label>}<label className="text-xs font-bold text-slate-700">Branch<input value={repoForm.branch} onChange={e=>setRepoForm({...repoForm,branch:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs focus:border-indigo-500"/></label></div><button onClick={submitRepository} disabled={indexing} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:brightness-105 disabled:opacity-50 transition"><Code2 size={15}/>{indexing?"Indexing AST...":"Create & index repository"}</button><div className="mt-6 space-y-2">{repositories.length===0?<Empty/>:repositories.map(r=><div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs"><div><div className="font-bold text-slate-900">{r.name}</div><div className="font-mono text-[11px] text-slate-500">Project #{r.project_id} · {r.provider} · <span className="font-semibold text-indigo-600">{r.index_status}</span></div></div><span className="text-[11px] text-slate-400 font-mono">{r.last_indexed_at?new Date(r.last_indexed_at).toLocaleString():"Not indexed"}</span></div>)}</div></Section>}
    </div>
}

function Section({title,children}:{title:string;children:ReactNode}) { return <div className="rounded-xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-5">{children}</div></div> }
function Empty(){ return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">Nothing to review.</div> }
function Stat({label,value,icon}:{label:string;value:number;icon:ReactNode}){return <div className="rounded-xl border bg-white p-5"><div className="flex items-center justify-between text-slate-500"><span>{label}</span>{icon}</div><div className="mt-3 text-3xl font-bold">{value}</div></div>}
function ProjectCard({project,users,members,membersLoading,onToggleMembers,onAssign,onRemove,onArchive,onDelete}:{project:any;users:any[];members?:Member[];membersLoading:boolean;onToggleMembers:()=>void;onAssign:(id:number)=>void;onRemove:(id:number)=>void;onArchive:()=>void;onDelete:()=>void}){const [uid,setUid]=useState("");return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-bold text-slate-900">{project.name}</div><div className="text-xs text-slate-500 font-mono">{project.slug} · <span className={`font-semibold ${project.status==='active'?'text-emerald-600':'text-amber-600'}`}>{project.status}</span></div></div><div className="flex items-center gap-2"><button onClick={onToggleMembers} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">{members?"Hide members":"Members"}</button>{project.status==="active"&&<button onClick={onArchive} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"><Archive size={13}/>Archive</button>}<button onClick={()=>{if(window.confirm(`Are you sure you want to delete "${project.name}"? This will remove all associated members and resources.`)) onDelete();}} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"><Trash2 size={13}/>Delete</button></div></div><div className="mt-4 flex gap-2"><select value={uid} onChange={e=>setUid(e.target.value)} className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none"><option value="">Assign employee...</option>{users.filter(u=>u.role==="employee"&&u.approval_status==="APPROVED"&&u.is_active).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select><button disabled={!uid || project.status!=="active"} onClick={()=>{onAssign(Number(uid));setUid("")}} className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition">Assign</button></div>{membersLoading&&<div className="mt-3 text-xs text-slate-500">Loading members...</div>}{members&&<div className="mt-3 space-y-1.5">{members.length===0?<div className="text-xs text-slate-400 italic">No assigned members yet.</div>:members.map(m=>{const u=users.find(x=>x.id===m.user_id);return <div key={m.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs"><div><span className="font-semibold text-slate-800">{u?.name||`User ${m.user_id}`}</span><span className="ml-2 font-mono text-[10px] text-slate-500 rounded bg-white px-1.5 py-0.5 border border-slate-200">{m.permission}</span></div><button onClick={()=>onRemove(m.user_id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"><Trash2 size={12}/>Remove</button></div>})}</div>}</div>}
