import React, { useState, useEffect } from "react";
import {
  Home, Users, Layers, BarChart3, Wallet, PiggyBank, FileText, Lock, LogOut,
  Search, Download, Printer, Plus, Pencil, Trash2, Camera, AlertTriangle,
  Check, X, ArrowUpDown, GraduationCap, Menu as MenuIcon, Award, BookOpen, ListOrdered, Package,
} from "lucide-react";
import { supabase } from "./supabaseClient";

/* ================= Design tokens ================= */
const C = {
  ink: "#1F3A32", inkDeep: "#16281F", paper: "#EDF0EA", paperCard: "#F7F8F4",
  brass: "#B8863A", brassSoft: "#EFE1C8", rose: "#C1573F", roseSoft: "#F3DED7",
  sage: "#5B7A62", sageSoft: "#DEE8DE", text: "#232823", textSoft: "#5B645C", line: "#D9DED4",
};
const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
    .f-display{font-family:'Fraunces',serif} .f-body{font-family:'Public Sans',sans-serif} .f-mono{font-family:'IBM Plex Mono',monospace}
    @media print { .no-print{display:none !important} .print-area{position:absolute;top:0;left:0;width:100%} }
  `}</style>
);
const uid = (p) => p + Math.random().toString(36).slice(2, 8);
const nomMat = (s) => s ? `${s.prenoms} ${s.nom} — Matricule : ${s.matricule}` : "—";
const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const ANNEES_SCOLAIRES = Array.from({ length: 20 }, (_, i) => `${2026 + i}-${2027 + i}`);

/* ================= Données de démonstration ================= */
const initClasses = () => ([
  { id: "cl1", nom: "Petite Section", montantAnnuel: 150000 },
  { id: "cl2", nom: "Moyenne Section", montantAnnuel: 150000 },
  { id: "cl3", nom: "Grande Section", montantAnnuel: 150000 },
]);
const initStudents = () => ([
  { id: "e1", prenoms: "Léa", nom: "Bernard", sexe: "F", naissance: "2021-03-12", lieuNaissance: "", statut: "Ancien", matricule: "MAT-0001", classeId: "cl1", parent: "Mme Bernard", telephone: "07 01 02 03 04", photo: null },
  { id: "e2", prenoms: "Noah", nom: "Petit", sexe: "M", naissance: "2021-06-02", lieuNaissance: "", statut: "Ancien", matricule: "MAT-0002", classeId: "cl1", parent: "M. Petit", telephone: "07 02 03 04 05", photo: null },
  { id: "e3", prenoms: "Inès", nom: "Dubois", sexe: "F", naissance: "2020-01-20", lieuNaissance: "", statut: "Nouveau", matricule: "MAT-0003", classeId: "cl2", parent: "Mme Dubois", telephone: "07 03 04 05 06", photo: null },
  { id: "e4", prenoms: "Rayan", nom: "Fontaine", sexe: "M", naissance: "2020-08-11", lieuNaissance: "", statut: "Ancien", matricule: "MAT-0004", classeId: "cl2", parent: "M. Fontaine", telephone: "07 04 05 06 07", photo: null },
  { id: "e5", prenoms: "Camille", nom: "Roy", sexe: "F", naissance: "2019-04-09", lieuNaissance: "", statut: "Nouveau", matricule: "MAT-0005", classeId: "cl3", parent: "Mme Roy", telephone: "07 05 06 07 08", photo: null },
  { id: "e6", prenoms: "Hugo", nom: "Simon", sexe: "M", naissance: "2019-11-30", lieuNaissance: "", statut: "Ancien", matricule: "MAT-0006", classeId: "cl3", parent: "M. Simon", telephone: "07 06 07 08 09", photo: null },
]);
const initTranches = () => ([
  { id: "t1", nom: "1ère Tranche", limite: "2026-05-15" },
  { id: "t2", nom: "2e Tranche", limite: "2026-09-15" },
  { id: "t3", nom: "3e Tranche", limite: "2027-01-15" },
]);
const initPaiements = () => ([
  { id: "p1", studentId: "e1", trancheId: "t1", montant: 50000, date: "2026-05-02", mode: "Espèces" },
  { id: "p2", studentId: "e3", trancheId: "t1", montant: 50000, date: "2026-05-04", mode: "Mobile Money" },
  { id: "p3", studentId: "e5", trancheId: "t1", montant: 30000, date: "2026-05-10", mode: "Espèces" },
]);
const initStaff = () => ([
  { id: "s1", nom: "Mme Rivière", poste: "Enseignante", salaire: 150000 },
  { id: "s2", nom: "M. Kouassi", poste: "Enseignant", salaire: 150000 },
  { id: "s3", nom: "Mme Fall", poste: "Directrice", salaire: 200000 },
]);
const initPaieHist = () => ([{ id: "ph1", staffId: "s1", mois: "Juin 2026", montant: 150000, date: "2026-06-30" }]);
const initDepenses = () => ([
  { id: "d1", categorie: "Fournitures", montant: 30000, date: "2026-06-05", description: "Craies, cahiers" },
  { id: "d2", categorie: "Électricité", montant: 25000, date: "2026-06-10", description: "Facture juin" },
]);
const initMatieres = () => ({
  cl1: [{ id: "mt1", nom: "Langage", coef: 2 }, { id: "mt2", nom: "Graphisme", coef: 1 }, { id: "mt3", nom: "Éveil scientifique", coef: 1 }],
});
const initNotes = () => ([
  { id: "n1", studentId: "e1", matiereId: "mt1", trimestre: "Trimestre 1", note: 16 },
  { id: "n2", studentId: "e1", matiereId: "mt2", trimestre: "Trimestre 1", note: 14 },
  { id: "n3", studentId: "e1", matiereId: "mt3", trimestre: "Trimestre 1", note: 15 },
  { id: "n4", studentId: "e2", matiereId: "mt1", trimestre: "Trimestre 1", note: 12 },
  { id: "n5", studentId: "e2", matiereId: "mt2", trimestre: "Trimestre 1", note: 10 },
]);
const initMateriels = () => ([
  { id: "mat1", nom: "Tables-bancs", quantite: 15, classeId: "cl1", etat: "Bon état", dateEntree: "2026-01-10" },
  { id: "mat2", nom: "Tableau noir", quantite: 1, classeId: "cl1", etat: "Bon état", dateEntree: "2026-01-10" },
  { id: "mat3", nom: "Craies (boîtes)", quantite: 20, classeId: "", etat: "Bon état", dateEntree: "2026-06-01" },
]);

/* ================= Utilitaires UI ================= */
function Card({ children, style, className }) {
  return <div className={className} style={{ background: C.paperCard, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16, marginBottom: 14, ...style }}>{children}</div>;
}
function Input(props) {
  return <input {...props} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13, fontFamily: "'Public Sans',sans-serif", ...(props.style || {}) }} />;
}
function Select(props) {
  return <select {...props} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13, fontFamily: "'Public Sans',sans-serif", ...(props.style || {}) }} />;
}
function Btn({ children, onClick, kind = "primary", style, type = "button", className }) {
  const styles = {
    primary: { background: C.ink, color: "#fff" },
    ghost: { background: "#fff", color: C.text, border: `1px solid ${C.line}` },
    danger: { background: C.roseSoft, color: C.rose },
    brass: { background: C.brassSoft, color: C.brass },
  };
  return (
    <button type={type} onClick={onClick} className={className} style={{
      border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, fontWeight: 700,
      cursor: "pointer", display: "flex", alignItems: "center", gap: 6, ...styles[kind], ...style,
    }}>{children}</button>
  );
}
function Th({ children, onClick, sortable }) {
  return (
    <th onClick={onClick} style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, color: C.textSoft, fontWeight: 700, borderBottom: `1px solid ${C.line}`, cursor: sortable ? "pointer" : "default", userSelect: "none" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{children}{sortable && <ArrowUpDown size={11} />}</span>
    </th>
  );
}
function Td({ children, style }) { return <td style={{ padding: "8px 10px", fontSize: 12.5, color: C.text, borderBottom: `1px solid ${C.line}`, ...style }}>{children}</td>; }
function Pill_({ text, color, bg }) { return <span style={{ background: bg, color, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{text}</span>; }

function exportCSV(filename, headers, rows) {
  const csv = [headers.join(";"), ...rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";"))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ================= App ================= */
export default function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState(""); const [pwd, setPwd] = useState(""); const [pwdErr, setPwdErr] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [menu, setMenu] = useState("accueil");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [classes, setClasses] = useState(initClasses());
  const [students, setStudents] = useState(initStudents());
  const [tranches, setTranches] = useState(initTranches());
  const [paiements, setPaiements] = useState(initPaiements());
  const [staff, setStaff] = useState(initStaff());
  const [paieHist, setPaieHist] = useState(initPaieHist());
  const [depenses, setDepenses] = useState(initDepenses());
  const [matieresConfig, setMatieresConfig] = useState(initMatieres());
  const [notes, setNotes] = useState(initNotes());
  const [materiels, setMateriels] = useState(initMateriels());
  const [archives, setArchives] = useState({});

  /* ---- Paramètres généraux (devise, bulletin, mot de passe comptabilité) ---- */
  const [config, setConfig] = useState({ devise: "GNF", etablissement: "GROUPE SCOLAIRE PRIVÉ CARMEL", etablissementAdresse: "", etablissementTels: "", etablissementEmail: "", ire: "", dpe: "", anneeScolaire: "2026-2027", bareme: 20, comptaPassword: "compta2026", logo: null });
  const [periodes, setPeriodes] = useState(["Trimestre 1", "Trimestre 2", "Trimestre 3"]);
  const [nouvellePeriode, setNouvellePeriode] = useState("");
  const fmt = (n) => Number(n || 0).toLocaleString("fr-FR") + " " + config.devise;
  const mention = (n) => {
    if (n == null) return "—";
    const r = n / config.bareme * 20;
    return r >= 16 ? "Très Bien" : r >= 14 ? "Bien" : r >= 12 ? "Assez Bien" : r >= 10 ? "Passable" : "Insuffisant";
  };

  /* ---- Connexion Supabase : session + chargement/sauvegarde des données ---- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from("app_state").select("data").eq("id", "main").maybeSingle();
      if (data && data.data) {
        const d = data.data;
        setClasses(d.classes || initClasses());
        setStudents(d.students || initStudents());
        setTranches(d.tranches || initTranches());
        setPaiements(d.paiements || initPaiements());
        setStaff(d.staff || initStaff());
        setPaieHist(d.paieHist || initPaieHist());
        setDepenses(d.depenses || initDepenses());
        setMatieresConfig(d.matieresConfig || initMatieres());
        setNotes(d.notes || initNotes());
        setMateriels(d.materiels || initMateriels());
        setArchives(d.archives || {});
        setConfig(d.config || { devise: "GNF", etablissement: "GROUPE SCOLAIRE PRIVÉ CARMEL", etablissementAdresse: "", etablissementTels: "", etablissementEmail: "", ire: "", dpe: "", anneeScolaire: "2026-2027", bareme: 20, comptaPassword: "compta2026", logo: null });
        setPeriodes(d.periodes || ["Trimestre 1", "Trimestre 2", "Trimestre 3"]);
      } else {
        await supabase.from("app_state").insert({
          id: "main",
          data: {
            classes: initClasses(), students: initStudents(), tranches: initTranches(), paiements: initPaiements(),
            staff: initStaff(), paieHist: initPaieHist(), depenses: initDepenses(), matieresConfig: initMatieres(),
            notes: initNotes(), materiels: initMateriels(), archives: {}, config: { devise: "GNF", etablissement: "GROUPE SCOLAIRE PRIVÉ CARMEL", etablissementAdresse: "", etablissementTels: "", etablissementEmail: "", ire: "", dpe: "", anneeScolaire: "2026-2027", bareme: 20, comptaPassword: "compta2026", logo: null },
            periodes: ["Trimestre 1", "Trimestre 2", "Trimestre 3"],
          },
        });
      }
      setDataLoaded(true);
    })();
  }, [session]);

  useEffect(() => {
    if (!session || !dataLoaded) return;
    const t = setTimeout(() => {
      supabase.from("app_state").upsert({
        id: "main",
        data: { classes, students, tranches, paiements, staff, paieHist, depenses, matieresConfig, notes, materiels, archives, config, periodes },
        updated_at: new Date().toISOString(),
      }).then();
    }, 800);
    return () => clearTimeout(t);
  }, [classes, students, tranches, paiements, staff, paieHist, depenses, matieresConfig, notes, materiels, archives, config, periodes, session, dataLoaded]);

  const [comptaAuthed, setComptaAuthed] = useState(false);
  const [comptaPwd, setComptaPwd] = useState(""); const [comptaErr, setComptaErr] = useState(false);

  /* ---- Élèves ---- */
  const [eleveForm, setEleveForm] = useState(null);
  const [eleveSearch, setEleveSearch] = useState(""); const [eleveFiltreClasse, setEleveFiltreClasse] = useState("");
  const [eleveSort, setEleveSort] = useState({ champ: "nom", dir: 1 });

  /* ---- Classes ---- */
  const [nouvelleClasse, setNouvelleClasse] = useState("");
  const [classeSelectionnee, setClasseSelectionnee] = useState(null);

  /* ---- Bulletin ---- */
  const [bulClasse, setBulClasse] = useState("cl1");
  const [bulTrimestre, setBulTrimestre] = useState("Trimestre 1");
  const [bulEleve, setBulEleve] = useState("");
  const [matiereForm, setMatiereForm] = useState(null);
  const [printAllView, setPrintAllView] = useState(false);

  /* ---- Saisie de notes ---- */
  const [saisieClasse, setSaisieClasse] = useState("cl1");
  const [saisieTrimestre, setSaisieTrimestre] = useState("Trimestre 1");

  /* ---- Matériels didactiques ---- */
  const [materielForm, setMaterielForm] = useState(null);
  const [materielFiltreClasse, setMaterielFiltreClasse] = useState("");

  /* ---- Comptabilité (+ Finance + Statistiques, sous contrôle du comptable) ---- */
  const [compTab, setCompTab] = useState("effectifs");
  const [trancheForm, setTrancheForm] = useState(null);
  const [paieClasseFiltre, setPaieClasseFiltre] = useState("");
  const [paieForm, setPaieForm] = useState({ studentId: "", trancheId: "", montant: "", mode: "Espèces" });
  const [recuId, setRecuId] = useState(null);
  const [staffForm, setStaffForm] = useState(null);
  const [paieAnnee, setPaieAnnee] = useState(new Date().getFullYear());
  const [depForm, setDepForm] = useState({ categorie: "", montant: "", description: "" });
  const [suiviClasse, setSuiviClasse] = useState("cl1");
  const [suiviSort, setSuiviSort] = useState({ champ: "nom", dir: 1 });
  const [redevablesClasse, setRedevablesClasse] = useState("cl1");

  const today = new Date().toISOString().slice(0, 10);

  /* ---------- Calculs ---------- */
  const classStats = (classeId) => {
    const l = students.filter(s => s.classeId === classeId);
    return { garcons: l.filter(s => s.sexe === "M").length, filles: l.filter(s => s.sexe === "F").length, total: l.length };
  };
  const studentPaid = (id) => paiements.filter(p => p.studentId === id).reduce((s, p) => s + Number(p.montant), 0);
  const studentAttendu = (s) => Number(classes.find(c => c.id === s?.classeId)?.montantAnnuel || 0);
  const studentReste = (s) => studentAttendu(s) - studentPaid(s.id);
  const totalEntrees = paiements.reduce((s, p) => s + Number(p.montant), 0);
  const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant), 0);
  const totalPaieVersee = paieHist.reduce((s, p) => s + Number(p.montant), 0);
  const bilan = totalEntrees - totalDepenses - totalPaieVersee;

  /* ---------- Actions Élèves / Classes ---------- */
  const saveEleve = () => {
    if (!eleveForm.prenoms || !eleveForm.nom) return;
    if (eleveForm.id) setStudents(prev => prev.map(s => s.id === eleveForm.id ? eleveForm : s));
    else setStudents(prev => [...prev, { ...eleveForm, id: uid("e") }]);
    setEleveForm(null);
  };
  const deleteEleve = (id) => setStudents(prev => prev.filter(s => s.id !== id));
  const handlePhoto = (file) => {
    const reader = new FileReader();
    reader.onload = () => setEleveForm(f => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  };
  const addClasse = () => { if (!nouvelleClasse.trim()) return; setClasses(prev => [...prev, { id: uid("cl"), nom: nouvelleClasse.trim(), montantAnnuel: 0 }]); setNouvelleClasse(""); };
  const renameClasse = (id, nom) => setClasses(prev => prev.map(c => c.id === id ? { ...c, nom } : c));
  const setMontantAnnuelClasse = (id, montant) => setClasses(prev => prev.map(c => c.id === id ? { ...c, montantAnnuel: montant } : c));
  const changerAnneeScolaire = (nouvelle) => {
    if (!nouvelle || nouvelle === config.anneeScolaire) return;
    const dejaArchivee = !!archives[nouvelle];
    const ok = window.confirm(
      dejaArchivee
        ? `Revenir sur l'année scolaire ${nouvelle} ? Les données de ${config.anneeScolaire} seront mises de côté et celles de ${nouvelle} seront restaurées.`
        : `Passer à l'année scolaire ${nouvelle} ?\n\nLes données de ${config.anneeScolaire} (notes, paiements, salaires, dépenses) seront archivées — vous pourrez les revoir en revenant sur cette année plus tard.\nLa liste des élèves et des classes reste commune à toutes les années.`
    );
    if (!ok) return;
    const anneeQuittee = config.anneeScolaire;
    const donneesCibles = archives[nouvelle] || { notes: [], paiements: [], paieHist: [], depenses: [] };
    setArchives(prev => ({ ...prev, [anneeQuittee]: { notes, paiements, paieHist, depenses } }));
    setNotes(donneesCibles.notes || []);
    setPaiements(donneesCibles.paiements || []);
    setPaieHist(donneesCibles.paieHist || []);
    setDepenses(donneesCibles.depenses || []);
    setConfig(prev => ({ ...prev, anneeScolaire: nouvelle }));
  };
  const deleteClasse = (id) => { setClasses(prev => prev.filter(c => c.id !== id)); if (classeSelectionnee === id) setClasseSelectionnee(null); };
  const addPeriode = () => { if (!nouvellePeriode.trim()) return; setPeriodes(prev => [...prev, nouvellePeriode.trim()]); setNouvellePeriode(""); };
  const renamePeriode = (i, val) => setPeriodes(prev => prev.map((p, idx) => idx === i ? val : p));
  const deletePeriode = (i) => setPeriodes(prev => prev.filter((_, idx) => idx !== i));

  /* ---------- Actions Bulletin ---------- */
  const saveMatiere = () => {
    if (!matiereForm.nom || !matiereForm.coef) return;
    setMatieresConfig(prev => {
      const list = prev[bulClasse] || [];
      const updated = matiereForm.id ? list.map(m => m.id === matiereForm.id ? matiereForm : m) : [...list, { ...matiereForm, id: uid("mt") }];
      return { ...prev, [bulClasse]: updated };
    });
    setMatiereForm(null);
  };
  const deleteMatiere = (id) => setMatieresConfig(prev => ({ ...prev, [bulClasse]: (prev[bulClasse] || []).filter(m => m.id !== id) }));
  const setNote = (studentId, matiereId, trimestre, value) => {
    setNotes(prev => {
      const existing = prev.find(n => n.studentId === studentId && n.matiereId === matiereId && n.trimestre === trimestre);
      const val = value === "" ? null : Number(value);
      if (existing) return prev.map(n => n === existing ? { ...n, note: val } : n);
      return [...prev, { id: uid("n"), studentId, matiereId, trimestre, note: val }];
    });
  };
  const rangMatiere = (matiereId, trimestre, studentId) => {
    const classeId = students.find(s => s.id === studentId)?.classeId;
    const notesClasse = notes.filter(n => n.matiereId === matiereId && n.trimestre === trimestre && n.note != null && students.find(s => s.id === n.studentId)?.classeId === classeId);
    const noteEleve = notesClasse.find(n => n.studentId === studentId)?.note;
    if (noteEleve == null) return "—";
    const meilleurs = notesClasse.filter(n => n.note > noteEleve).length;
    return `${meilleurs + 1}${meilleurs === 0 ? "er" : "e"}`;
  };
  const moyenneEleve = (studentId, classeId, trimestre) => {
    const mats = matieresConfig[classeId] || [];
    let sc = 0, sp = 0;
    mats.forEach(m => {
      const n = notes.find(x => x.studentId === studentId && x.matiereId === m.id && x.trimestre === trimestre)?.note;
      if (n != null) { sc += Number(m.coef); sp += n * Number(m.coef); }
    });
    return sc ? sp / sc : null;
  };
  const classementClasse = (classeId, trimestre) => {
    const eleves = students.filter(s => s.classeId === classeId);
    return eleves.map(s => ({ student: s, moyenne: moyenneEleve(s.id, classeId, trimestre) }))
      .sort((a, b) => { if (a.moyenne == null) return 1; if (b.moyenne == null) return -1; return b.moyenne - a.moyenne; });
  };
  const rangGeneral = (studentId, classeId, trimestre) => {
    const classement = classementClasse(classeId, trimestre).filter(x => x.moyenne != null);
    const moy = classement.find(x => x.student.id === studentId)?.moyenne;
    if (moy == null) return "—";
    const meilleurs = classement.filter(x => x.moyenne > moy).length;
    return `${meilleurs + 1}${meilleurs === 0 ? "er" : "e"} / ${classement.length}`;
  };

  /* ---------- Actions Comptabilité / Finance ---------- */
  const saveTranche = () => {
    if (!trancheForm.nom) return;
    if (trancheForm.id) setTranches(prev => prev.map(t => t.id === trancheForm.id ? trancheForm : t));
    else setTranches(prev => [...prev, { ...trancheForm, id: uid("t") }]);
    setTrancheForm(null);
  };
  const deleteTranche = (id) => setTranches(prev => prev.filter(t => t.id !== id));
  const enregistrerPaiement = () => {
    if (!paieForm.studentId || !paieForm.trancheId || !paieForm.montant) return;
    const id = uid("p");
    setPaiements(prev => [...prev, { id, ...paieForm, montant: Number(paieForm.montant), date: today }]);
    setPaieForm({ studentId: "", trancheId: "", montant: "", mode: "Espèces" });
    setRecuId(id);
  };
  const saveStaff = () => {
    if (!staffForm.nom || !staffForm.salaire) return;
    if (staffForm.id) setStaff(prev => prev.map(s => s.id === staffForm.id ? staffForm : s));
    else setStaff(prev => [...prev, { ...staffForm, id: uid("s") }]);
    setStaffForm(null);
  };
  const deleteStaff = (id) => setStaff(prev => prev.filter(s => s.id !== id));
  const dejaPayeMois = (staffId, moisLabel) => paieHist.some(p => p.staffId === staffId && p.mois === moisLabel);
  const payerMois = (s, moisLabel) => setPaieHist(prev => [...prev, { id: uid("ph"), staffId: s.id, mois: moisLabel, montant: s.salaire, date: today }]);
  const addDepense = () => {
    if (!depForm.categorie || !depForm.montant) return;
    setDepenses(prev => [...prev, { id: uid("d"), ...depForm, montant: Number(depForm.montant), date: today }]);
    setDepForm({ categorie: "", montant: "", description: "" });
  };

  /* ---------- Actions Matériels didactiques ---------- */
  const saveMateriel = () => {
    if (!materielForm.nom || !materielForm.quantite) return;
    if (materielForm.id) setMateriels(prev => prev.map(m => m.id === materielForm.id ? materielForm : m));
    else setMateriels(prev => [...prev, { ...materielForm, id: uid("mat") }]);
    setMaterielForm(null);
  };
  const deleteMateriel = (id) => setMateriels(prev => prev.filter(m => m.id !== id));

  /* ---------- Logo de l'établissement ---------- */
  const handleLogo = (file) => {
    const reader = new FileReader();
    reader.onload = () => setConfig(prev => ({ ...prev, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  /* ---------- Écran de connexion principal ---------- */
  if (authChecking) {
    return <div className="f-body" style={{ minHeight: "100vh", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{FONTS}Chargement…</div>;
  }

  if (!session) {
    const seConnecter = async () => {
      setPwdErr(false);
      const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
      if (error) setPwdErr(true);
    };
    return (
      <div className="f-body" style={{ minHeight: "100vh", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        {FONTS}
        <Card style={{ width: 340, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${C.brass}`, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap color={C.brass} size={26} />
          </div>
          <div className="f-display" style={{ fontSize: 22, fontWeight: 600, color: C.text }}>Le Cahier — Gestion</div>
          <div style={{ fontSize: 12, color: C.textSoft, marginBottom: 16 }}>Accès réservé au gestionnaire</div>
          <Input type="email" placeholder="Adresse e-mail" value={email} onChange={e => { setEmail(e.target.value); setPwdErr(false); }}
            style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
          <Input type="password" placeholder="Mot de passe" value={pwd} onChange={e => { setPwd(e.target.value); setPwdErr(false); }}
            onKeyDown={e => e.key === "Enter" && seConnecter()}
            style={{ width: "100%", marginBottom: 10, boxSizing: "border-box" }} />
          {pwdErr && <div style={{ color: C.rose, fontSize: 12, marginBottom: 8 }}>E-mail ou mot de passe incorrect.</div>}
          <Btn style={{ width: "100%", justifyContent: "center" }} onClick={seConnecter}><Lock size={14} /> Se connecter</Btn>
          <div style={{ fontSize: 10, color: C.textSoft, marginTop: 12 }}>Le compte se crée depuis le tableau de bord Supabase (Authentication → Users).</div>
        </Card>
      </div>
    );
  }

  if (!dataLoaded) {
    return <div className="f-body" style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center" }}>{FONTS}Chargement des données…</div>;
  }

  const items = [
    { k: "accueil", label: "Accueil", icon: Home },
    { k: "eleves", label: "Élèves", icon: Users },
    { k: "classes", label: "Classes", icon: Layers },
    { k: "materiels", label: "Matériels didactiques", icon: Package },
    { k: "saisie", label: "Saisie de notes", icon: BookOpen },
    { k: "bulletin", label: "Bulletin", icon: Award },
    { k: "comptabilite", label: "Comptabilité", icon: Wallet },
  ];

  /* ================= Rendu des menus ================= */
  const renderAccueil = () => (
    <div>
      <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600, marginBottom: 4 }}>Tableau de bord</div>
      <div style={{ color: C.textSoft, fontSize: 13, marginBottom: 16 }}>Vue d'ensemble de l'établissement</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ fontSize: 24, color: C.ink, fontWeight: 600 }}>{students.length}</div><div style={{ fontSize: 11, color: C.textSoft }}>élèves inscrits</div></Card>
        <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ fontSize: 24, color: C.brass, fontWeight: 600 }}>{classes.length}</div><div style={{ fontSize: 11, color: C.textSoft }}>classes</div></Card>
        <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ fontSize: 24, color: C.sage, fontWeight: 600 }}>{notes.length}</div><div style={{ fontSize: 11, color: C.textSoft }}>notes saisies</div></Card>
        <Card style={{ textAlign: "center" }}>
          <div className="f-mono" style={{ fontSize: 24, color: C.textSoft, fontWeight: 600 }}>••••</div>
          <div style={{ fontSize: 11, color: C.textSoft }}>infos financières réservées au comptable</div>
        </Card>
      </div>
    </div>
  );

  const renderEleves = () => {
    let list = students.filter(s =>
      (!eleveFiltreClasse || s.classeId === eleveFiltreClasse) &&
      (`${s.prenoms} ${s.nom} ${s.matricule}`.toLowerCase().includes(eleveSearch.toLowerCase()))
    );
    list = [...list].sort((a, b) => {
      const va = eleveSort.champ === "classe" ? (classes.find(c => c.id === a.classeId)?.nom || "") : a[eleveSort.champ];
      const vb = eleveSort.champ === "classe" ? (classes.find(c => c.id === b.classeId)?.nom || "") : b[eleveSort.champ];
      return String(va).localeCompare(String(vb)) * eleveSort.dir;
    });
    const toggleSort = (champ) => setEleveSort(s => s.champ === champ ? { champ, dir: -s.dir } : { champ, dir: 1 });

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600 }}>Élèves</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn kind="ghost" onClick={() => exportCSV("eleves.csv", ["Prénoms", "Nom", "Sexe", "Naissance", "Matricule", "Classe", "Statut", "Parent", "Téléphone"], list.map(s => [s.prenoms, s.nom, s.sexe, s.naissance, s.matricule, classes.find(c => c.id === s.classeId)?.nom, s.statut, s.parent, s.telephone]))}><Download size={13} /> Exporter</Btn>
            <Btn onClick={() => setEleveForm({ prenoms: "", nom: "", sexe: "F", naissance: "", lieuNaissance: "", statut: "Nouveau", matricule: "", classeId: classes[0]?.id || "", parent: "", telephone: "", photo: null })}><Plus size={13} /> Ajouter un élève</Btn>
          </div>
        </div>

        {eleveForm && (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{eleveForm.id ? "Modifier l'élève" : "Nouvel élève"}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.paper, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {eleveForm.photo ? <img src={eleveForm.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera size={20} color={C.textSoft} />}
                </div>
                <label style={{ fontSize: 10, color: C.brass, cursor: "pointer", fontWeight: 700 }}>
                  Choisir une photo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handlePhoto(e.target.files[0])} />
                </label>
              </div>
              <div style={{ flex: 1, minWidth: 260, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Input placeholder="Prénoms" value={eleveForm.prenoms} onChange={e => setEleveForm({ ...eleveForm, prenoms: e.target.value })} />
                <Input placeholder="Nom" value={eleveForm.nom} onChange={e => setEleveForm({ ...eleveForm, nom: e.target.value })} />
                <Select value={eleveForm.sexe} onChange={e => setEleveForm({ ...eleveForm, sexe: e.target.value })}><option value="F">Féminin</option><option value="M">Masculin</option></Select>
                <Input type="date" value={eleveForm.naissance} onChange={e => setEleveForm({ ...eleveForm, naissance: e.target.value })} />
                <Input placeholder="Lieu de naissance" value={eleveForm.lieuNaissance || ""} onChange={e => setEleveForm({ ...eleveForm, lieuNaissance: e.target.value })} />
                <Input placeholder="Matricule" value={eleveForm.matricule} onChange={e => setEleveForm({ ...eleveForm, matricule: e.target.value })} />
                <Select value={eleveForm.classeId} onChange={e => setEleveForm({ ...eleveForm, classeId: e.target.value })}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
                <Input placeholder="Nom du parent" value={eleveForm.parent} onChange={e => setEleveForm({ ...eleveForm, parent: e.target.value })} />
                <Input placeholder="Téléphone" value={eleveForm.telephone} onChange={e => setEleveForm({ ...eleveForm, telephone: e.target.value })} />
                <Select value={eleveForm.statut || "Nouveau"} onChange={e => setEleveForm({ ...eleveForm, statut: e.target.value })}><option value="Nouveau">Nouveau</option><option value="Ancien">Ancien</option></Select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn onClick={saveEleve}><Check size={13} /> Enregistrer</Btn>
              <Btn kind="ghost" onClick={() => setEleveForm(null)}><X size={13} /> Annuler</Btn>
            </div>
          </Card>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <Input placeholder="Rechercher un élève ou matricule…" value={eleveSearch} onChange={e => setEleveSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <Select value={eleveFiltreClasse} onChange={e => setEleveFiltreClasse(e.target.value)}><option value="">Toutes les classes</option>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
        </div>

        <Card style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <Th>Photo</Th>
              <Th sortable onClick={() => toggleSort("nom")}>Nom</Th>
              <Th sortable onClick={() => toggleSort("sexe")}>Sexe</Th>
              <Th sortable onClick={() => toggleSort("naissance")}>Naissance</Th>
              <Th sortable onClick={() => toggleSort("matricule")}>Matricule</Th>
              <Th sortable onClick={() => toggleSort("classe")}>Classe</Th>
              <Th sortable onClick={() => toggleSort("statut")}>Statut</Th>
              <Th>Parent</Th><Th>Téléphone</Th><Th>Actions</Th>
            </tr></thead>
            <tbody>
              {list.map(s => (
                <tr key={s.id}>
                  <Td><div style={{ width: 30, height: 30, borderRadius: "50%", background: C.paper, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.photo ? <img src={s.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera size={12} color={C.textSoft} />}</div></Td>
                  <Td style={{ fontWeight: 600 }}>{s.prenoms} {s.nom}</Td>
                  <Td>{s.sexe}</Td><Td>{s.naissance}</Td><Td className="f-mono">{s.matricule}</Td>
                  <Td>{classes.find(c => c.id === s.classeId)?.nom || "—"}</Td>
                  <Td><Pill_ text={s.statut || "Nouveau"} color={s.statut === "Ancien" ? C.brass : C.sage} bg={s.statut === "Ancien" ? C.brassSoft : C.sageSoft} /></Td>
                  <Td>{s.parent}</Td><Td>{s.telephone}</Td>
                  <Td><div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setEleveForm(s)} style={{ background: "none", border: "none", cursor: "pointer" }}><Pencil size={14} color={C.textSoft} /></button>
                    <button onClick={() => deleteEleve(s.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
                  </div></Td>
                </tr>
              ))}
              {!list.length && <tr><Td style={{ textAlign: "center", color: C.textSoft }} colSpan={10}>Aucun élève trouvé.</Td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    );
  };

  const renderClasses = () => {
    const selStudents = classeSelectionnee ? students.filter(s => s.classeId === classeSelectionnee) : [];
    return (
      <div>
        <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600, marginBottom: 4 }}>Classes</div>
        <div style={{ color: C.textSoft, fontSize: 13, marginBottom: 16 }}>Ajoutez autant de niveaux que nécessaire — aucune limite.</div>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Année scolaire</div>
          <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Chaque année scolaire garde ses propres notes, paiements, salaires et dépenses. Vous pouvez revenir sur une année passée à tout moment pour la revoir.</div>
          <Select value={config.anneeScolaire} onChange={e => changerAnneeScolaire(e.target.value)}>
            {ANNEES_SCOLAIRES.map(a => <option key={a} value={a}>{a}</option>)}
          </Select>
        </Card>
        <Card>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Input placeholder="Nom du nouveau niveau (ex : CP)" value={nouvelleClasse} onChange={e => setNouvelleClasse(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addClasse()} style={{ flex: 1 }} />
            <Btn onClick={addClasse}><Plus size={13} /> Ajouter</Btn>
          </div>
          {classes.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: `1px solid ${C.line}` }}>
              <Input value={c.nom} onChange={e => renameClasse(c.id, e.target.value)} style={{ flex: 1 }} />
              <Input placeholder="Cycle (ex : Secondaire)" value={c.cycle || ""} onChange={e => setClasses(prev => prev.map(x => x.id === c.id ? { ...x, cycle: e.target.value } : x))} style={{ width: 150 }} />
              <span style={{ fontSize: 11, color: C.textSoft }}>{classStats(c.id).total} élève(s)</span>
              <Btn kind="ghost" onClick={() => setClasseSelectionnee(c.id)}>Voir la liste</Btn>
              <button onClick={() => deleteClasse(c.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
            </div>
          ))}
        </Card>

        {classeSelectionnee && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{classes.find(c => c.id === classeSelectionnee)?.nom} — {selStudents.length} élève(s)</div>
              <Btn kind="ghost" onClick={() => exportCSV(`${classes.find(c => c.id === classeSelectionnee)?.nom}.csv`, ["Prénoms", "Nom", "Sexe", "Matricule"], selStudents.map(s => [s.prenoms, s.nom, s.sexe, s.matricule]))}><Download size={13} /> Exporter</Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Nom</Th><Th>Sexe</Th><Th>Matricule</Th><Th>Parent</Th></tr></thead>
              <tbody>{[...selStudents].sort((a, b) => a.nom.localeCompare(b.nom)).map(s => (
                <tr key={s.id}><Td style={{ fontWeight: 600 }}>{s.prenoms} {s.nom}</Td><Td>{s.sexe}</Td><Td className="f-mono">{s.matricule}</Td><Td>{s.parent}</Td></tr>
              ))}</tbody>
            </table>
          </Card>
        )}
      </div>
    );
  };

  /* ----- Saisie de notes (tableau classe entière) ----- */
  const renderSaisie = () => {
    const matieres = matieresConfig[saisieClasse] || [];
    const eleves = students.filter(s => s.classeId === saisieClasse).sort((a, b) => a.nom.localeCompare(b.nom));
    const noteOf = (studentId, matiereId) => notes.find(n => n.studentId === studentId && n.matiereId === matiereId && n.trimestre === saisieTrimestre)?.note ?? null;

    return (
      <div>
        <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600, marginBottom: 4 }}>Saisie de notes</div>
        <div style={{ color: C.textSoft, fontSize: 13, marginBottom: 16 }}>Sélectionnez une classe : tous les élèves et toutes les matières apparaissent dans un seul tableau.</div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Select value={saisieClasse} onChange={e => setSaisieClasse(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
            <Select value={saisieTrimestre} onChange={e => setSaisieTrimestre(e.target.value)}>{periodes.map(t => <option key={t} value={t}>{t}</option>)}</Select>
          </div>
          <Btn kind="ghost" onClick={() => exportCSV(
            `notes-${classes.find(c => c.id === saisieClasse)?.nom}-${saisieTrimestre}.csv`,
            ["Nom", "Matricule", ...matieres.map(m => m.nom)],
            eleves.map(s => [`${s.prenoms} ${s.nom}`, s.matricule, ...matieres.map(m => noteOf(s.id, m.id) ?? "")])
          )}><Download size={13} /> Exporter vers Excel</Btn>
        </div>

        {!matieres.length ? (
          <Card><div style={{ fontSize: 12, color: C.textSoft }}>Aucune matière configurée pour cette classe. Rendez-vous dans le menu <b>Bulletin</b> pour ajouter les matières et coefficients de cette classe.</div></Card>
        ) : (
          <Card style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <Th>Élève</Th>
                {matieres.map(m => <Th key={m.id}>{m.nom} <span style={{ fontWeight: 400 }}>(coef {m.coef})</span></Th>)}
              </tr></thead>
              <tbody>
                {eleves.map(s => (
                  <tr key={s.id}>
                    <Td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{s.prenoms} {s.nom}<div className="f-mono" style={{ fontWeight: 400, fontSize: 10.5, color: C.textSoft }}>Matricule : {s.matricule}</div></Td>
                    {matieres.map(m => (
                      <Td key={m.id}>
                        <input type="number" min="0" max={config.bareme} step="0.5" value={noteOf(s.id, m.id) ?? ""} placeholder="—"
                          onChange={e => setNote(s.id, m.id, saisieTrimestre, e.target.value)}
                          style={{ width: 56, padding: "4px 6px", borderRadius: 6, border: `1px solid ${C.line}`, fontSize: 12.5 }} />
                      </Td>
                    ))}
                  </tr>
                ))}
                {!eleves.length && <tr><Td style={{ textAlign: "center", color: C.textSoft }} colSpan={matieres.length + 1}>Aucun élève dans cette classe.</Td></tr>}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    );
  };

  /* ----- Matériels didactiques ----- */
  const renderMateriels = () => {
    const liste = materiels.filter(m => !materielFiltreClasse || m.classeId === materielFiltreClasse);
    const totalGeneral = materiels.reduce((s, m) => s + Number(m.quantite || 0), 0);

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600 }}>Matériels didactiques</div>
            <div style={{ color: C.textSoft, fontSize: 13 }}>Enregistrez le matériel de l'école et répartissez-le entre les classes.</div>
          </div>
          <div className="no-print" style={{ display: "flex", gap: 8 }}>
            <Btn kind="ghost" onClick={() => window.print()}><Printer size={13} /> Imprimer le rapport</Btn>
            <Btn onClick={() => setMaterielForm({ nom: "", quantite: "", classeId: "", etat: "Bon état" })}><Plus size={13} /> Ajouter un matériel</Btn>
          </div>
        </div>

        {materielForm && (
          <Card className="no-print">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{materielForm.id ? "Modifier le matériel" : "Nouveau matériel"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <Input placeholder="Nom du matériel" value={materielForm.nom} onChange={e => setMaterielForm({ ...materielForm, nom: e.target.value })} />
              <Input type="number" min="0" placeholder="Quantité" value={materielForm.quantite} onChange={e => setMaterielForm({ ...materielForm, quantite: e.target.value })} />
              <Select value={materielForm.classeId} onChange={e => setMaterielForm({ ...materielForm, classeId: e.target.value })}>
                <option value="">Magasin / non affecté</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </Select>
              <Select value={materielForm.etat} onChange={e => setMaterielForm({ ...materielForm, etat: e.target.value })}>
                <option>Bon état</option><option>Usé</option><option>À remplacer</option>
              </Select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={saveMateriel}><Check size={13} /> Enregistrer</Btn>
              <Btn kind="ghost" onClick={() => setMaterielForm(null)}><X size={13} /> Annuler</Btn>
            </div>
          </Card>
        )}

        <div className="no-print" style={{ marginBottom: 10 }}>
          <Select value={materielFiltreClasse} onChange={e => setMaterielFiltreClasse(e.target.value)}>
            <option value="">Toutes les classes (et magasin)</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </Select>
        </div>

        <Card className="print-area" style={{ padding: 0, overflowX: "auto" }}>
          <div className="f-display" style={{ padding: 12, fontWeight: 700 }}>{config.etablissement} — Rapport des matériels didactiques</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Matériel</Th><Th>Quantité</Th><Th>Classe / Emplacement</Th><Th>État</Th><Th>Entrée</Th><Th className="no-print">Actions</Th></tr></thead>
            <tbody>
              {liste.map(m => (
                <tr key={m.id}>
                  <Td style={{ fontWeight: 600 }}>{m.nom}</Td>
                  <Td className="f-mono">{m.quantite}</Td>
                  <Td>{classes.find(c => c.id === m.classeId)?.nom || "Magasin"}</Td>
                  <Td>{m.etat}</Td>
                  <Td>{m.dateEntree}</Td>
                  <Td className="no-print"><div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setMaterielForm(m)} style={{ background: "none", border: "none", cursor: "pointer" }}><Pencil size={14} color={C.textSoft} /></button>
                    <button onClick={() => deleteMateriel(m.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
                  </div></Td>
                </tr>
              ))}
              {!liste.length && <tr><Td style={{ textAlign: "center", color: C.textSoft }} colSpan={6}>Aucun matériel enregistré.</Td></tr>}
              <tr style={{ background: C.paper, fontWeight: 700 }}>
                <Td>Total général</Td><Td className="f-mono">{totalGeneral}</Td><Td /><Td /><Td /><Td className="no-print" />
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    );
  };

  /* ----- Bulletin (au choix du responsable) ----- */
  const renderBulletinEleve = (studentId) => {
    const eleve = students.find(s => s.id === studentId);
    if (!eleve) return null;
    const classeId = eleve.classeId;
    const matieres = matieresConfig[classeId] || [];
    const noteOf = (matiereId) => notes.find(n => n.studentId === studentId && n.matiereId === matiereId && n.trimestre === bulTrimestre)?.note ?? null;
    let sommeCoef = 0, sommePondere = 0;
    matieres.forEach(m => { const n = noteOf(m.id); if (n != null) { sommeCoef += Number(m.coef); sommePondere += n * Number(m.coef); } });
    const moyenne = sommeCoef ? (sommePondere / sommeCoef).toFixed(2) : null;

    return (
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 11.5, lineHeight: 1.7, fontWeight: 700 }}>
            <div>{config.etablissement}</div>
            {config.etablissementAdresse && <div>{config.etablissementAdresse}</div>}
            {config.etablissementTels && <div>TÉLS : {config.etablissementTels}</div>}
            {config.ire && <div>IRE : {config.ire}</div>}
            {config.dpe && <div>DPE : {config.dpe}</div>}
          </div>
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid ${C.brass}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {config.logo ? <img src={config.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <GraduationCap size={26} color={C.brass} />}
          </div>
          <div style={{ fontSize: 11.5, lineHeight: 1.7, fontWeight: 700, textAlign: "right" }}>
            <div>RÉPUBLIQUE DE GUINÉE</div>
            <div style={{ fontWeight: 400, fontSize: 10.5 }}>Travail – Justice – Solidarité</div>
          </div>
        </div>

        <div className="f-display" style={{ textAlign: "center", fontWeight: 700, fontSize: 17, color: C.text, margin: "14px 0 2px", textTransform: "uppercase" }}>Bulletin de notes — {bulTrimestre}</div>
        {config.anneeScolaire && <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Année Scolaire : {config.anneeScolaire}</div>}

        <div style={{ border: `1px solid ${C.text}`, padding: 10, marginBottom: 12, fontSize: 12.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <span><b>NOM ET PRÉNOMS :</b> {eleve.nom} {eleve.prenoms}</span>
            <span><b>CLASSE :</b> {classes.find(c => c.id === classeId)?.nom}</span>
          </div>
          <div style={{ marginTop: 4 }}><b>MATRICULE :</b> <span className="f-mono">{eleve.matricule}</span></div>
          <div style={{ marginTop: 4 }}><b>DATE ET LIEU DE NAISSANCE :</b> {eleve.naissance}{eleve.lieuNaissance ? ` à ${eleve.lieuNaissance}` : ""}</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, border: `1px solid ${C.text}` }}>
          <thead><tr>
            {["Matière", "Moy", "Coeff", "Moy Coeff", "Rang", "Appréciation"].map(h => (
              <th key={h} style={{ background: C.ink, color: "#fff", padding: "7px 8px", textAlign: h === "Matière" || h === "Appréciation" ? "left" : "center", fontSize: 11, textTransform: "uppercase", border: `1px solid ${C.ink}` }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {matieres.map(m => {
              const n = noteOf(m.id);
              return (
                <tr key={m.id}>
                  <td style={{ padding: "6px 8px", fontWeight: 600, border: `1px solid ${C.line}` }}>{m.nom}</td>
                  <td style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>
                    <input type="number" min="0" max={config.bareme} step="0.5" value={n ?? ""} placeholder="—"
                      onChange={e => setNote(studentId, m.id, bulTrimestre, e.target.value)}
                      style={{ width: 50, textAlign: "center", padding: "3px 4px", borderRadius: 6, border: `1px solid ${C.line}`, fontSize: 12.5 }} />
                  </td>
                  <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{m.coef}</td>
                  <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{n != null ? (n * m.coef).toFixed(1).replace(/\.0$/, "") : "—"}</td>
                  <td style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{rangMatiere(m.id, bulTrimestre, studentId)}</td>
                  <td style={{ padding: "6px 8px", border: `1px solid ${C.line}` }}>{mention(n)}</td>
                </tr>
              );
            })}
            <tr style={{ background: C.ink, color: "#fff", fontWeight: 700 }}>
              <td style={{ padding: "7px 8px", border: `1px solid ${C.ink}` }}>TOTAL</td>
              <td style={{ border: `1px solid ${C.ink}` }}></td>
              <td className="f-mono" style={{ padding: "7px 8px", textAlign: "center", border: `1px solid ${C.ink}` }}>{sommeCoef}</td>
              <td className="f-mono" style={{ padding: "7px 8px", textAlign: "center", border: `1px solid ${C.ink}` }}>{sommePondere.toFixed(1).replace(/\.0$/, "")}</td>
              <td style={{ border: `1px solid ${C.ink}` }}></td><td style={{ border: `1px solid ${C.ink}` }}></td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 10 }}>
          <tbody><tr>
            <td style={{ background: C.ink, color: "#fff", fontWeight: 700, padding: "8px 10px" }}>MOYENNE</td>
            <td className="f-mono" style={{ padding: "8px 10px", border: `1px solid ${C.line}`, fontWeight: 700 }}>{moyenne ?? "—"} / {config.bareme}</td>
            <td style={{ background: C.ink, color: "#fff", fontWeight: 700, padding: "8px 10px" }}>RANG</td>
            <td className="f-mono" style={{ padding: "8px 10px", border: `1px solid ${C.line}`, fontWeight: 700 }} colSpan={3}>{rangGeneral(studentId, classeId, bulTrimestre)}</td>
          </tr></tbody>
        </table>

        <div className="no-print" style={{ marginTop: 14 }}>
          <Btn kind="ghost" onClick={() => { setBulEleve(studentId); setTimeout(() => window.print(), 50); }}><Printer size={13} /> Imprimer ce bulletin</Btn>
        </div>
      </Card>
    );
  };

  const renderImpressionTousBulletins = () => {
    const eleves = students.filter(s => s.classeId === bulClasse);
    return (
      <div>
        <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <Btn kind="ghost" onClick={() => setPrintAllView(false)}><X size={13} /> Fermer l'aperçu</Btn>
          <Btn onClick={() => window.print()}><Printer size={13} /> Imprimer les {eleves.length} bulletins</Btn>
        </div>
        {eleves.map(s => (
          <div key={s.id} style={{ pageBreakAfter: "always" }}>{renderBulletinEleve(s.id)}</div>
        ))}
      </div>
    );
  };

  const renderBulletin = () => {
    if (printAllView) return renderImpressionTousBulletins();

    const matieres = matieresConfig[bulClasse] || [];
    const classeEleves = students.filter(s => s.classeId === bulClasse);
    const classement = classementClasse(bulClasse, bulTrimestre);

    return (
      <div>
        <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600, marginBottom: 4 }}>Bulletin — configuration du responsable</div>
        <div style={{ color: C.textSoft, fontSize: 13, marginBottom: 16 }}>Bulletin par trimestre, calculé automatiquement à partir des matières et coefficients configurés.</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Select value={bulClasse} onChange={e => { setBulClasse(e.target.value); setBulEleve(""); }}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
          <Select value={bulTrimestre} onChange={e => setBulTrimestre(e.target.value)}>{periodes.map(t => <option key={t} value={t}>{t}</option>)}</Select>
          <Select value={bulEleve} onChange={e => setBulEleve(e.target.value)}><option value="">Voir un bulletin individuel…</option>{classeEleves.map(s => <option key={s.id} value={s.id}>{nomMat(s)}</option>)}</Select>
        </div>

        <Card className="no-print">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Configuration du bulletin</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 4 }}>Nom de l'établissement</div>
              <Input value={config.etablissement} onChange={e => setConfig({ ...config, etablissement: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 4 }}>Adresse (ex : SIS À SENKEFARA)</div>
              <Input value={config.etablissementAdresse} onChange={e => setConfig({ ...config, etablissementAdresse: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 4 }}>Téléphones</div>
              <Input value={config.etablissementTels} onChange={e => setConfig({ ...config, etablissementTels: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 4 }}>E-mail</div>
              <Input value={config.etablissementEmail || ""} onChange={e => setConfig({ ...config, etablissementEmail: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 4 }}>Année scolaire</div>
              <div style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13, background: C.paper, color: C.text }}>{config.anneeScolaire}</div>
              <div style={{ fontSize: 10, color: C.textSoft, marginTop: 2 }}>Modifiable dans le menu Classes</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 4 }}>IRE</div>
              <Input value={config.ire} onChange={e => setConfig({ ...config, ire: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 4 }}>DPE</div>
              <Input value={config.dpe} onChange={e => setConfig({ ...config, dpe: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 4 }}>Barème (note sur…)</div>
              <Input type="number" min="1" value={config.bareme} onChange={e => setConfig({ ...config, bareme: Number(e.target.value) || 20 })} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 6 }}>Périodes (trimestres/semestres — à volonté)</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <Input placeholder="Nouvelle période (ex : Semestre 1)" value={nouvellePeriode} onChange={e => setNouvellePeriode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addPeriode()} style={{ flex: 1 }} />
            <Btn onClick={addPeriode}><Plus size={13} /></Btn>
          </div>
          {periodes.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <Input value={p} onChange={e => renamePeriode(i, e.target.value)} style={{ flex: 1 }} />
              <button onClick={() => deletePeriode(i)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
            </div>
          ))}
        </Card>

        <Card className="no-print">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Matières & coefficients — {classes.find(c => c.id === bulClasse)?.nom}</div>
          <Btn onClick={() => setMatiereForm({ nom: "", coef: 1 })} style={{ marginBottom: 10 }}><Plus size={13} /> Ajouter une matière</Btn>
          {matiereForm && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              <Input placeholder="Nom de la matière" value={matiereForm.nom} onChange={e => setMatiereForm({ ...matiereForm, nom: e.target.value })} />
              <Input type="number" min="1" placeholder="Coefficient" value={matiereForm.coef} onChange={e => setMatiereForm({ ...matiereForm, coef: e.target.value })} style={{ width: 110 }} />
              <Btn onClick={saveMatiere}><Check size={13} /></Btn>
              <Btn kind="ghost" onClick={() => setMatiereForm(null)}><X size={13} /></Btn>
            </div>
          )}
          {matieres.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${C.line}` }}>
              <div>{m.nom} <span className="f-mono" style={{ color: C.textSoft, fontSize: 11 }}>coef {m.coef}</span></div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setMatiereForm(m)} style={{ background: "none", border: "none", cursor: "pointer" }}><Pencil size={14} color={C.textSoft} /></button>
                <button onClick={() => deleteMatiere(m.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
              </div>
            </div>
          ))}
          {!matieres.length && <div style={{ fontSize: 12, color: C.textSoft }}>Aucune matière configurée pour cette classe.</div>}
        </Card>

        <Card className="no-print">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}><ListOrdered size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />Classement — {classes.find(c => c.id === bulClasse)?.nom} ({bulTrimestre})</div>
            <Btn onClick={() => setPrintAllView(true)}><Printer size={13} /> Imprimer tous les bulletins de la classe</Btn>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Rang</Th><Th>Élève</Th><Th>Moyenne</Th><Th>Mention</Th></tr></thead>
            <tbody>
              {classement.map((c, i) => (
                <tr key={c.student.id} onClick={() => setBulEleve(c.student.id)} style={{ cursor: "pointer" }}>
                  <Td style={{ fontWeight: 700 }}>{i + 1}{i === 0 ? "er" : "e"}</Td>
                  <Td style={{ fontWeight: 600 }}>{c.student.prenoms} {c.student.nom}<div className="f-mono" style={{ fontWeight: 400, fontSize: 10.5, color: C.textSoft }}>Matricule : {c.student.matricule}</div></Td>
                  <Td className="f-mono">{c.moyenne != null ? c.moyenne.toFixed(2) : "—"}</Td>
                  <Td><Pill_ text={mention(c.moyenne)} color={c.moyenne >= 12 ? C.sage : c.moyenne >= 10 ? C.brass : C.rose} bg={c.moyenne >= 12 ? C.sageSoft : c.moyenne >= 10 ? C.brassSoft : C.roseSoft} /></Td>
                </tr>
              ))}
              {!classement.length && <tr><Td style={{ textAlign: "center", color: C.textSoft }} colSpan={4}>Aucun élève dans cette classe.</Td></tr>}
            </tbody>
          </table>
        </Card>

        {bulEleve && <div className="print-area">{renderBulletinEleve(bulEleve)}</div>}
      </div>
    );
  };

  /* ----- Comptabilité (inclut désormais Statistiques + Finance) ----- */
  const renderComptabilite = () => {
    if (!comptaAuthed) return (
      <Card style={{ width: 320, margin: "40px auto", textAlign: "center" }}>
        <Lock size={22} color={C.brass} style={{ marginBottom: 8 }} />
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Accès Comptabilité</div>
        <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Statistiques, paiements et finances sont réservés au comptable.</div>
        <Input type="password" placeholder="Mot de passe comptabilité" value={comptaPwd} onChange={e => { setComptaPwd(e.target.value); setComptaErr(false); }}
          onKeyDown={e => e.key === "Enter" && (comptaPwd === config.comptaPassword ? setComptaAuthed(true) : setComptaErr(true))}
          style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
        {comptaErr && <div style={{ color: C.rose, fontSize: 12, marginBottom: 8 }}>Mot de passe incorrect.</div>}
        <Btn style={{ width: "100%", justifyContent: "center" }} onClick={() => comptaPwd === config.comptaPassword ? setComptaAuthed(true) : setComptaErr(true)}>Déverrouiller</Btn>
      </Card>
    );

    const recu = recuId ? paiements.find(p => p.id === recuId) : null;
    const totalG = students.filter(s => s.sexe === "M").length, totalF = students.filter(s => s.sexe === "F").length;
    const subtabs = [
      ["effectifs", "Statistiques"], ["suivi", "Suivi par classe"], ["redevables", "Liste des redevables"], ["tranches", "Tranches"], ["paiement", "Paiement"],
      ["stats", "Stats paiement"],
      ["personnel", "Personnel / Paie"], ["depenses", "Dépenses"], ["rapport", "Rapport global"], ["parametres", "Paramètres"],
    ];

    return (
      <div>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600 }}>Comptabilité</div>
          <Btn kind="ghost" onClick={() => setComptaAuthed(false)}><Lock size={13} /> Verrouiller</Btn>
        </div>
        <div className="no-print" style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {subtabs.map(([k, l]) => <Btn key={k} kind={compTab === k ? "primary" : "ghost"} onClick={() => setCompTab(k)}>{l}</Btn>)}
        </div>

        {compTab === "effectifs" && (
          <Card style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Classe</Th><Th>Garçons</Th><Th>Filles</Th><Th>Total</Th><Th>Répartition</Th></tr></thead>
              <tbody>
                {classes.map(c => { const st = classStats(c.id); const pct = st.total ? Math.round(st.garcons / st.total * 100) : 0;
                  return (
                    <tr key={c.id}>
                      <Td style={{ fontWeight: 600 }}>{c.nom}</Td><Td>{st.garcons}</Td><Td>{st.filles}</Td><Td className="f-mono">{st.total}</Td>
                      <Td><div style={{ width: 100, height: 8, borderRadius: 4, background: C.roseSoft, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: C.sage }} /></div></Td>
                    </tr>
                  );
                })}
                <tr><Td style={{ fontWeight: 700 }}>Total général</Td><Td style={{ fontWeight: 700 }}>{totalG}</Td><Td style={{ fontWeight: 700 }}>{totalF}</Td><Td className="f-mono" style={{ fontWeight: 700 }}>{students.length}</Td><Td /></tr>
              </tbody>
            </table>
          </Card>
        )}

        {compTab === "suivi" && (() => {
          let liste = students.filter(s => s.classeId === suiviClasse);
          liste = [...liste].sort((a, b) => {
            const va = suiviSort.champ === "reste" ? studentReste(a) : suiviSort.champ === "paye" ? studentPaid(a.id) : a[suiviSort.champ];
            const vb = suiviSort.champ === "reste" ? studentReste(b) : suiviSort.champ === "paye" ? studentPaid(b.id) : b[suiviSort.champ];
            return (typeof va === "number" ? va - vb : String(va).localeCompare(String(vb))) * suiviSort.dir;
          });
          const toggleSuiviSort = (champ) => setSuiviSort(s => s.champ === champ ? { champ, dir: -s.dir } : { champ, dir: 1 });
          return (
            <div>
              <div className="no-print" style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <Select value={suiviClasse} onChange={e => setSuiviClasse(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
                <Btn kind="ghost" onClick={() => window.print()}><Printer size={13} /> Imprimer la liste</Btn>
              </div>
              <Card className="print-area" style={{ padding: 0, overflowX: "auto" }}>
                <div className="f-display" style={{ padding: 12, fontWeight: 700 }}>{config.etablissement} — {classes.find(c => c.id === suiviClasse)?.nom}</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <Th>N°</Th>
                    <Th sortable onClick={() => toggleSuiviSort("nom")}>Prénoms et Nom</Th>
                    <Th>Matricule</Th>
                    <Th sortable onClick={() => toggleSuiviSort("sexe")}>Sexe</Th>
                    <Th>Parent</Th><Th>Contact</Th>
                    <Th sortable onClick={() => toggleSuiviSort("paye")}>Montant total payé</Th>
                    <Th sortable onClick={() => toggleSuiviSort("reste")}>Montant total restant</Th>
                    <Th>Observations</Th>
                  </tr></thead>
                  <tbody>
                    {liste.map((s, i) => { const paye = studentPaid(s.id); const reste = studentReste(s); const fini = reste <= 0;
                      return (
                        <tr key={s.id}>
                          <Td className="f-mono">{i + 1}</Td>
                          <Td style={{ fontWeight: 600 }}>{s.prenoms} {s.nom}</Td>
                          <Td className="f-mono">{s.matricule}</Td>
                          <Td>{s.sexe}</Td><Td>{s.parent}</Td><Td>{s.telephone}</Td>
                          <Td className="f-mono">{fmt(paye)}</Td>
                          <Td className="f-mono">{fmt(reste > 0 ? reste : 0)}</Td>
                          <Td><Pill_ text={fini ? "Fini" : "En cours"} color={fini ? C.sage : C.rose} bg={fini ? C.sageSoft : C.roseSoft} /></Td>
                        </tr>
                      );
                    })}
                    {!liste.length && <tr><Td style={{ textAlign: "center", color: C.textSoft }} colSpan={9}>Aucun élève dans cette classe.</Td></tr>}
                  </tbody>
                </table>
              </Card>
            </div>
          );
        })()}

        {compTab === "redevables" && (() => {
          const liste = students.filter(s => s.classeId === redevablesClasse && studentReste(s) > 0);
          return (
            <div>
              <div className="no-print" style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <Select value={redevablesClasse} onChange={e => setRedevablesClasse(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
                <Btn kind="ghost" onClick={() => window.print()}><Printer size={13} /> Imprimer la liste</Btn>
              </div>
              <Card className="print-area" style={{ padding: 0, overflowX: "auto" }}>
                <div className="f-display" style={{ padding: 12, fontWeight: 700 }}>{config.etablissement} — Liste des redevables — {classes.find(c => c.id === redevablesClasse)?.nom}</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <Th>N°</Th><Th>Prénoms et Nom</Th><Th>Matricule</Th><Th>Sexe</Th><Th>Parent</Th><Th>Contact</Th><Th>Montant restant</Th>
                  </tr></thead>
                  <tbody>
                    {liste.map((s, i) => (
                      <tr key={s.id}>
                        <Td className="f-mono">{i + 1}</Td>
                        <Td style={{ fontWeight: 600 }}>{s.prenoms} {s.nom}</Td>
                        <Td className="f-mono">{s.matricule}</Td>
                        <Td>{s.sexe}</Td><Td>{s.parent}</Td><Td>{s.telephone}</Td>
                        <Td className="f-mono" style={{ color: C.rose, fontWeight: 700 }}>{fmt(studentReste(s))}</Td>
                      </tr>
                    ))}
                    {!liste.length && <tr><Td style={{ textAlign: "center", color: C.textSoft }} colSpan={7}>Aucun redevable dans cette classe — tous les paiements sont à jour.</Td></tr>}
                  </tbody>
                </table>
              </Card>
            </div>
          );
        })()}

        {compTab === "tranches" && (
          <div>
            <Card>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Montant annuel par classe</div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Chaque classe a un montant total dû pour l'année, identique pour tous ses élèves.</div>
              {classes.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: `1px solid ${C.line}` }}>
                  <div style={{ flex: 1, fontWeight: 600 }}>{c.nom}</div>
                  <Input type="number" min="0" value={c.montantAnnuel || 0} onChange={e => setMontantAnnuelClasse(c.id, Number(e.target.value) || 0)} style={{ width: 160 }} />
                  <span style={{ fontSize: 11, color: C.textSoft }}>{config.devise}</span>
                </div>
              ))}
            </Card>

            <Card>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Tranches (échéances)</div>
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Les tranches servent à repérer à quel versement correspond un paiement — elles n'ont pas de montant propre.</div>
              <Btn onClick={() => setTrancheForm({ nom: "", limite: "" })} style={{ marginBottom: 10 }}><Plus size={13} /> Nouvelle tranche</Btn>
              {trancheForm && (
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  <Input placeholder="Nom (ex: 1ère Tranche)" value={trancheForm.nom} onChange={e => setTrancheForm({ ...trancheForm, nom: e.target.value })} />
                  <Input type="date" value={trancheForm.limite || ""} onChange={e => setTrancheForm({ ...trancheForm, limite: e.target.value })} />
                  <Btn onClick={saveTranche}><Check size={13} /></Btn>
                  <Btn kind="ghost" onClick={() => setTrancheForm(null)}><X size={13} /></Btn>
                </div>
              )}
              {tranches.map(t => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${C.line}` }}>
                  <div><b>{t.nom}</b>{t.limite && <span style={{ color: C.textSoft, fontSize: 11 }}> · échéance {t.limite}</span>}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setTrancheForm(t)} style={{ background: "none", border: "none", cursor: "pointer" }}><Pencil size={14} color={C.textSoft} /></button>
                    <button onClick={() => deleteTranche(t.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {compTab === "paiement" && (
          <Card>
            <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <Select value={paieClasseFiltre} onChange={e => { setPaieClasseFiltre(e.target.value); setPaieForm({ ...paieForm, studentId: "" }); }}>
                <option value="">Classe…</option>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </Select>
              <Select value={paieForm.studentId} onChange={e => setPaieForm({ ...paieForm, studentId: e.target.value })} disabled={!paieClasseFiltre}>
                <option value="">{paieClasseFiltre ? "Élève…" : "Choisissez d'abord une classe"}</option>
                {students.filter(s => s.classeId === paieClasseFiltre).map(s => <option key={s.id} value={s.id}>{nomMat(s)}</option>)}
              </Select>
              <Select value={paieForm.trancheId} onChange={e => setPaieForm({ ...paieForm, trancheId: e.target.value })}><option value="">Tranche…</option>{tranches.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}</Select>
              <Input type="number" placeholder="Montant versé" value={paieForm.montant} onChange={e => setPaieForm({ ...paieForm, montant: e.target.value })} />
              <Select value={paieForm.mode} onChange={e => setPaieForm({ ...paieForm, mode: e.target.value })}><option>Espèces</option><option>Mobile Money</option><option>Virement</option><option>Chèque</option></Select>
            </div>
            <Btn className="no-print" onClick={enregistrerPaiement}><Check size={13} /> Enregistrer le paiement</Btn>

            {recu && (() => {
              const el = students.find(s => s.id === recu.studentId);
              const classeEl = classes.find(c => c.id === el?.classeId);
              const paye = studentPaid(recu.studentId);
              const attendu = studentAttendu(el);
              const reste = studentReste(el);
              const numero = paiements.findIndex(p => p.id === recu.id) + 1;
              const dateHeure = `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
              const Section = ({ title }) => (
                <div style={{ background: C.ink, color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 11.5, padding: "6px 0", textTransform: "uppercase", marginTop: 16, border: `1px solid ${C.ink}` }}>{title}</div>
              );
              const Row = ({ label, value, bold }) => (
                <tr>
                  <Td style={{ color: C.textSoft, padding: "6px 10px", width: "50%", border: `1px solid ${C.line}` }}>{label}</Td>
                  <Td className="f-mono" style={{ padding: "6px 10px", textAlign: "center", fontWeight: bold ? 700 : 500, border: `1px solid ${C.line}` }}>{value}</Td>
                </tr>
              );
              return (
                <div className="print-area" style={{ marginTop: 16, border: `2px solid ${C.ink}`, borderRadius: 4, padding: 26, background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", paddingBottom: 14, borderBottom: `2px solid ${C.ink}` }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${C.brass}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        {config.logo ? <img src={config.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <GraduationCap size={24} color={C.brass} />}
                      </div>
                      <div style={{ fontSize: 11.5, lineHeight: 1.6 }}>
                        <div className="f-display" style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>{config.etablissement}</div>
                        {config.etablissementAdresse && <div>{config.etablissementAdresse}</div>}
                        {config.etablissementTels && <div>{config.etablissementTels}</div>}
                        {config.etablissementEmail && <div>{config.etablissementEmail}</div>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="f-display" style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase" }}>Reçu de paiement</div>
                      <div className="f-mono" style={{ fontSize: 22, fontWeight: 700, color: C.brass }}>N° {numero}</div>
                      <div style={{ fontSize: 11, color: C.textSoft, marginTop: 4 }}>DATE : {dateHeure}</div>
                    </div>
                  </div>

                  <Section title="Informations élève" />
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}><tbody>
                    <Row label="Nom et Prénoms" value={`${el?.nom} ${el?.prenoms}`} bold />
                    <Row label="Matricule" value={el?.matricule} />
                    <Row label="Statut" value={el?.statut || "Nouveau"} />
                  </tbody></table>

                  <Section title="Informations scolaire" />
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}><tbody>
                    <Row label="Classe" value={classeEl?.nom} />
                    <Row label="Libellé classe" value={classeEl?.nom} />
                    <Row label="Année scolaire" value={config.anneeScolaire} />
                  </tbody></table>

                  <Section title="Informations paiement" />
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}><tbody>
                    <Row label="Libellé paiement" value={tranches.find(t => t.id === recu.trancheId)?.nom} />
                    <Row label="Montant à payer" value={fmt(attendu)} />
                    <Row label="Montant payé" value={fmt(paye)} bold />
                    <Row label="Date de paiement" value={recu.date} />
                    <Row label="Reste à payer" value={reste > 0 ? fmt(reste) : "—"} bold />
                  </tbody></table>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 }}>
                    <div style={{ fontSize: 10.5, fontStyle: "italic", color: C.textSoft }}>Merci de conserver ce reçu.</div>
                    <div style={{ textAlign: "center", fontSize: 11, color: C.textSoft }}>
                      <div style={{ width: 160, borderTop: `1px solid ${C.text}`, marginBottom: 4 }} />
                      Signature / Cachet
                    </div>
                  </div>

                  <Btn kind="ghost" className="no-print" onClick={() => window.print()} style={{ marginTop: 16 }}><Printer size={13} /> Imprimer le reçu</Btn>
                </div>
              );
            })()}
          </Card>
        )}

        {compTab === "stats" && (
          <Card style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Classe</Th><Th>Montant attendu</Th><Th>Montant Perçu</Th><Th>Taux</Th></tr></thead>
              <tbody>{classes.map(c => { const n = classStats(c.id).total; const attendu = n * Number(c.montantAnnuel || 0);
                const percu = students.filter(s => s.classeId === c.id).reduce((s, st) => s + studentPaid(st.id), 0);
                const taux = attendu ? Math.round(percu / attendu * 100) : 0;
                return <tr key={c.id}><Td style={{ fontWeight: 600 }}>{c.nom}</Td><Td className="f-mono">{fmt(attendu)}</Td><Td className="f-mono">{fmt(percu)}</Td><Td style={{ color: taux >= 80 ? C.sage : taux >= 40 ? C.brass : C.rose, fontWeight: 700 }}>{taux}%</Td></tr>;
              })}</tbody>
            </table>
          </Card>
        )}

        {compTab === "personnel" && (
          <Card style={{ padding: 0, overflowX: "auto" }}>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                <Btn onClick={() => setStaffForm({ nom: "", poste: "", salaire: "" })}><Plus size={13} /> Ajouter un employé</Btn>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: C.textSoft }}>Année :</span>
                  <Input type="number" value={paieAnnee} onChange={e => setPaieAnnee(Number(e.target.value) || paieAnnee)} style={{ width: 90 }} />
                </div>
              </div>
              {staffForm && (
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  <Input placeholder="Nom" value={staffForm.nom} onChange={e => setStaffForm({ ...staffForm, nom: e.target.value })} />
                  <Input placeholder="Poste" value={staffForm.poste} onChange={e => setStaffForm({ ...staffForm, poste: e.target.value })} />
                  <Input type="number" placeholder="Salaire mensuel" value={staffForm.salaire} onChange={e => setStaffForm({ ...staffForm, salaire: e.target.value })} />
                  <Btn onClick={saveStaff}><Check size={13} /></Btn><Btn kind="ghost" onClick={() => setStaffForm(null)}><X size={13} /></Btn>
                </div>
              )}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <Th>Nom</Th><Th>Poste</Th><Th>Salaire</Th>
                {MOIS.map(m => <Th key={m}>{m.slice(0, 3)}</Th>)}
                <Th>Actions</Th>
              </tr></thead>
              <tbody>{staff.map(s => (
                <tr key={s.id}>
                  <Td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{s.nom}</Td><Td>{s.poste}</Td><Td className="f-mono">{fmt(s.salaire)}</Td>
                  {MOIS.map(m => {
                    const label = `${m} ${paieAnnee}`;
                    const paye = dejaPayeMois(s.id, label);
                    return (
                      <Td key={m} style={{ textAlign: "center" }}>
                        {paye
                          ? <Check size={15} color={C.sage} style={{ verticalAlign: "middle" }} />
                          : <button onClick={() => payerMois(s, label)} title={`Marquer ${label} payé`} style={{ background: C.brassSoft, color: C.brass, border: "none", borderRadius: 6, padding: "2px 6px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Payer</button>}
                      </Td>
                    );
                  })}
                  <Td><div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setStaffForm(s)} style={{ background: "none", border: "none", cursor: "pointer" }}><Pencil size={14} color={C.textSoft} /></button>
                    <button onClick={() => deleteStaff(s.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
                  </div></Td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
        )}

        {compTab === "depenses" && (
          <Card>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              <Input placeholder="Catégorie" value={depForm.categorie} onChange={e => setDepForm({ ...depForm, categorie: e.target.value })} />
              <Input type="number" placeholder="Montant" value={depForm.montant} onChange={e => setDepForm({ ...depForm, montant: e.target.value })} />
              <Input placeholder="Description" value={depForm.description} onChange={e => setDepForm({ ...depForm, description: e.target.value })} style={{ flex: 1 }} />
              <Btn onClick={addDepense}><Plus size={13} /></Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Date</Th><Th>Catégorie</Th><Th>Description</Th><Th>Montant</Th></tr></thead>
              <tbody>{[...depenses].sort((a, b) => b.date.localeCompare(a.date)).map(d => (
                <tr key={d.id}><Td>{d.date}</Td><Td style={{ fontWeight: 600 }}>{d.categorie}</Td><Td>{d.description}</Td><Td className="f-mono">{fmt(d.montant)}</Td></tr>
              ))}</tbody>
            </table>
          </Card>
        )}

        {compTab === "parametres" && (
          <Card style={{ maxWidth: 360 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Devise</div>
            <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 6 }}>Utilisée pour tous les montants (paiements, reçus, paie, dépenses, bilan).</div>
            <Select value={config.devise} onChange={e => setConfig({ ...config, devise: e.target.value })} style={{ width: "100%", marginBottom: 8 }}>
              <option value="GNF">GNF — Franc guinéen</option>
              <option value="XOF">XOF — Franc CFA (BCEAO)</option>
              <option value="XAF">XAF — Franc CFA (BEAC)</option>
              <option value="EUR">EUR — Euro</option>
              <option value="USD">USD — Dollar américain</option>
              <option value="AUTRE">Autre (saisie libre)</option>
            </Select>
            {config.devise === "AUTRE" && (
              <Input placeholder="Code ou symbole de la devise" onChange={e => setConfig({ ...config, devise: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
            )}
            <div style={{ marginTop: 12, fontSize: 12, color: C.textSoft }}>Aperçu : <b className="f-mono" style={{ color: C.text }}>{fmt(125000)}</b></div>
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Mot de passe comptabilité</div>
              <Input type="text" value={config.comptaPassword} onChange={e => setConfig({ ...config, comptaPassword: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: C.textSoft, marginTop: 4 }}>Communiquez ce mot de passe uniquement au comptable.</div>
            </div>
          </Card>
        )}

        {compTab === "parametres" && (
          <Card style={{ maxWidth: 360, marginTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Logo de l'école</div>
            <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Affiché sur l'en-tête du reçu de paiement et du bulletin.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${C.brass}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {config.logo ? <img src={config.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <GraduationCap size={24} color={C.brass} />}
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.brass, fontWeight: 700, cursor: "pointer" }}>
                  Choisir un logo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handleLogo(e.target.files[0])} />
                </label>
                {config.logo && <div><button onClick={() => setConfig({ ...config, logo: null })} style={{ background: "none", border: "none", color: C.rose, fontSize: 11, cursor: "pointer", padding: 0, marginTop: 4 }}>Retirer le logo</button></div>}
              </div>
            </div>
          </Card>
        )}

        {compTab === "rapport" && (
          <div className="print-area">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <Btn kind="ghost" className="no-print" onClick={() => window.print()}><Printer size={13} /> Imprimer</Btn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
              <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ color: C.sage, fontWeight: 700 }}>{fmt(totalEntrees)}</div><div style={{ fontSize: 11, color: C.textSoft }}>Total entrées</div></Card>
              <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ color: C.rose, fontWeight: 700 }}>{fmt(totalDepenses)}</div><div style={{ fontSize: 11, color: C.textSoft }}>Dépenses</div></Card>
              <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ color: C.brass, fontWeight: 700 }}>{fmt(totalPaieVersee)}</div><div style={{ fontSize: 11, color: C.textSoft }}>Paie versée</div></Card>
              <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ color: bilan >= 0 ? C.ink : C.rose, fontWeight: 700 }}>{fmt(bilan)}</div><div style={{ fontSize: 11, color: C.textSoft }}>Bilan net</div></Card>
            </div>
            <Card>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Effectifs</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th>Classe</Th><Th>Garçons</Th><Th>Filles</Th><Th>Total</Th></tr></thead>
                <tbody>{classes.map(c => { const st = classStats(c.id); return <tr key={c.id}><Td>{c.nom}</Td><Td>{st.garcons}</Td><Td>{st.filles}</Td><Td className="f-mono">{st.total}</Td></tr>; })}</tbody>
              </table>
            </Card>
            <Card>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Taux de recouvrement global</div>
              <div className="f-mono" style={{ fontSize: 16 }}>{(() => { const attenduTotal = students.reduce((s, st) => s + studentAttendu(st), 0); return attenduTotal ? Math.round(totalEntrees / attenduTotal * 100) : 0; })()}%</div>
              <div style={{ fontSize: 12, color: C.textSoft, marginTop: 4 }}>Élèves redevables (paiement en cours) : <b style={{ color: C.rose }}>{students.filter(s => studentReste(s) > 0).length}</b></div>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const pages = { accueil: renderAccueil, eleves: renderEleves, classes: renderClasses, materiels: renderMateriels, saisie: renderSaisie, bulletin: renderBulletin, comptabilite: renderComptabilite };

  return (
    <div className="f-body" style={{ minHeight: "100vh", background: C.paper, display: "flex" }}>
      {FONTS}
      <div className="no-print" style={{ width: sidebarOpen ? 210 : 60, background: C.ink, transition: "width .2s", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 8, color: "#fff", cursor: "pointer" }} onClick={() => setSidebarOpen(o => !o)}>
          <MenuIcon size={18} />{sidebarOpen && <span className="f-display" style={{ fontSize: 15, fontWeight: 600 }}>Le Cahier</span>}
        </div>
        {items.map(it => (
          <button key={it.k} onClick={() => setMenu(it.k)} style={{
            background: menu === it.k ? "rgba(255,255,255,0.1)" : "none", border: "none", color: "#fff", padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderLeft: menu === it.k ? `3px solid ${C.brass}` : "3px solid transparent",
          }}>
            <it.icon size={17} />{sidebarOpen && <span style={{ fontSize: 13 }}>{it.label}</span>}
          </button>
        ))}
        <div style={{ marginTop: "auto", padding: 16 }}>
          <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: "#B9C4B9", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <LogOut size={16} />{sidebarOpen && <span style={{ fontSize: 12 }}>Déconnexion</span>}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>{pages[menu]()}</div>
    </div>
  );
}
