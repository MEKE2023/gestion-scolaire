import React, { useState, useEffect } from "react";
import {
  Home, Users, Layers, BarChart3, Wallet, PiggyBank, FileText, Lock, LogOut,
  Search, Download, Printer, Plus, Pencil, Trash2, Camera, AlertTriangle,
  Check, X, ArrowUpDown, GraduationCap, Menu as MenuIcon, Award, BookOpen, ListOrdered, Package, Trophy, Eye, EyeOff, ClipboardCheck,
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
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    @media print {
      .no-print{display:none !important}
      @page{margin:0}
      body{margin:0}
      .print-area{position:absolute;top:0;left:0;width:100%;box-sizing:border-box;padding:14mm !important}
      .print-area *{box-sizing:border-box}
      .print-area table, .print-area th, .print-area td{border-collapse:collapse !important}
    }
  `}</style>
);
const uid = (p) => p + Math.random().toString(36).slice(2, 8);
const nomMat = (s) => s ? `${s.prenoms} ${s.nom} — Matricule : ${s.matricule}` : "—";
const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const ANNEES_SCOLAIRES = Array.from({ length: 20 }, (_, i) => `${2026 + i}-${2027 + i}`);
const NIVEAUX_STANDARDS = ["Petite Section", "Moyenne Section", "Grande Section", "1ère", "2ème", "3ème", "4ème", "5ème", "6ème", "7ème", "8ème", "9ème", "10ème", "11ème", "12ème", "Terminale"];

/* ================= Données de démonstration ================= */
const initClasses = () => ([
  { id: "cl1", nom: "Petite Section", montantAnnuel: 150000, bareme: 20, periodes: ["Trimestre 1", "Trimestre 2", "Trimestre 3"] },
  { id: "cl2", nom: "Moyenne Section", montantAnnuel: 150000, bareme: 20, periodes: ["Trimestre 1", "Trimestre 2", "Trimestre 3"] },
  { id: "cl3", nom: "Grande Section", montantAnnuel: 150000, bareme: 20, periodes: ["Trimestre 1", "Trimestre 2", "Trimestre 3"] },
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

function parseCSV(text) {
  const clean = text.replace(/^\uFEFF/, "");
  const lignes = clean.split(/\r?\n/).filter(l => l.trim().length);
  return lignes.map(ligne => {
    const cellules = []; let cellule = ""; let dansGuillemets = false;
    for (let i = 0; i < ligne.length; i++) {
      const c = ligne[i];
      if (dansGuillemets) {
        if (c === '"' && ligne[i + 1] === '"') { cellule += '"'; i++; }
        else if (c === '"') dansGuillemets = false;
        else cellule += c;
      } else {
        if (c === '"') dansGuillemets = true;
        else if (c === ";") { cellules.push(cellule); cellule = ""; }
        else cellule += c;
      }
    }
    cellules.push(cellule);
    return cellules;
  });
}

/* ================= App ================= */
export default function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState(""); const [pwd, setPwd] = useState(""); const [pwdErr, setPwdErr] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [retrySaveTick, setRetrySaveTick] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [menu, setMenu] = useState("accueil");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [classes, setClasses] = useState(initClasses());
  const [students, setStudents] = useState(initStudents());
  const [paiements, setPaiements] = useState(initPaiements());
  const [staff, setStaff] = useState(initStaff());
  const [paieHist, setPaieHist] = useState(initPaieHist());
  const [depenses, setDepenses] = useState(initDepenses());
  const [matieresConfig, setMatieresConfig] = useState(initMatieres());
  const [tranchesEcole, setTranchesEcole] = useState(initTranches());
  const [configNiveaux, setConfigNiveaux] = useState({});
  const [notes, setNotes] = useState(initNotes());
  const [materiels, setMateriels] = useState(initMateriels());
  const [archives, setArchives] = useState({});
  const [conduites, setConduites] = useState([]);

  /* ---- Paramètres généraux (devise, bulletin, mot de passe comptabilité) ---- */
  const [config, setConfig] = useState({ devise: "GNF", etablissement: "GROUPE SCOLAIRE PRIVÉ CARMEL", etablissementAdresse: "", etablissementTels: "", etablissementEmail: "", ire: "", dpe: "", anneeScolaire: "2026-2027", bareme: 20, comptaPassword: "compta2026", logo: null });
  const fmt = (n) => Number(n || 0).toLocaleString("fr-FR") + " " + config.devise;
  const mention = (n, bareme = 20) => {
    if (n == null) return "—";
    const r = n / bareme * 20;
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
    setLoadError(null);
    (async () => {
      const { data, error } = await supabase.from("app_state").select("data").eq("id", "main").maybeSingle();

      if (error) {
        // Vraie erreur (réseau, Supabase indisponible...) : on ne touche à RIEN pour ne jamais écraser les vraies données.
        setLoadError(error.message || "Erreur de connexion à la base de données.");
        return;
      }

      if (data && data.data) {
        const d = data.data;
        setClasses(d.classes || initClasses());
        const studentsCharges = d.students || initStudents();
        const staffCharge = d.staff || initStaff();
        const idsEleves = new Set(studentsCharges.map(s => s.id));
        const idsStaff = new Set(staffCharge.map(s => s.id));

        setStudents(studentsCharges);
        setPaiements((d.paiements || initPaiements()).filter(p => idsEleves.has(p.studentId)));
        setStaff(staffCharge);
        setPaieHist((d.paieHist || initPaieHist()).filter(p => idsStaff.has(p.staffId)));
        setDepenses(d.depenses || initDepenses());
        setMatieresConfig(d.matieresConfig || initMatieres());
        setTranchesEcole(d.tranchesEcole || initTranches());
        setConfigNiveaux(d.configNiveaux || {});
        setNotes((d.notes || initNotes()).filter(n => idsEleves.has(n.studentId)));
        setMateriels(d.materiels || initMateriels());
        setArchives(d.archives || {});
        setConduites((d.conduites || []).filter(c => idsEleves.has(c.studentId)));
        {
          const loadedConfig = d.config || { devise: "GNF", etablissement: "GROUPE SCOLAIRE PRIVÉ CARMEL", etablissementAdresse: "", etablissementTels: "", etablissementEmail: "", ire: "", dpe: "", anneeScolaire: "2026-2027", bareme: 20, comptaPassword: "compta2026", logo: null };
          setConfig({
            ...loadedConfig,
            anneeScolaire: ANNEES_SCOLAIRES.includes(loadedConfig.anneeScolaire) ? loadedConfig.anneeScolaire : ANNEES_SCOLAIRES[0],
          });
        }
      } else {
        // Aucune ligne trouvée ET aucune erreur : c'est vraiment une toute première installation.
        await supabase.from("app_state").insert({
          id: "main",
          data: {
            classes: initClasses(), students: initStudents(), paiements: initPaiements(),
            staff: initStaff(), paieHist: initPaieHist(), depenses: initDepenses(), matieresConfig: initMatieres(), tranchesEcole: initTranches(),
            notes: initNotes(), materiels: initMateriels(), archives: {}, conduites: [], configNiveaux: {}, config: { devise: "GNF", etablissement: "GROUPE SCOLAIRE PRIVÉ CARMEL", etablissementAdresse: "", etablissementTels: "", etablissementEmail: "", ire: "", dpe: "", anneeScolaire: "2026-2027", bareme: 20, comptaPassword: "compta2026", logo: null },
          },
        });
      }
      setDataLoaded(true);
    })();
  }, [session, retryCount]);

  useEffect(() => {
    if (!session || !dataLoaded) return;
    const t = setTimeout(() => {
      setSaveStatus("saving");
      supabase.from("app_state").upsert({
        id: "main",
        data: { classes, students, paiements, staff, paieHist, depenses, matieresConfig, configNiveaux, tranchesEcole, notes, materiels, archives, conduites, config },
        updated_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) {
          setSaveStatus("error");
          // Nouvelle tentative automatique après 5 secondes si le réseau était juste faible/coupé.
          setTimeout(() => setRetrySaveTick(x => x + 1), 5000);
        } else {
          setSaveStatus("saved");
        }
      });
    }, 800);
    return () => clearTimeout(t);
  }, [classes, students, paiements, staff, paieHist, depenses, matieresConfig, configNiveaux, tranchesEcole, notes, materiels, archives, conduites, config, session, dataLoaded, retrySaveTick]);


  /* ---- Élèves ---- */
  const [eleveForm, setEleveForm] = useState(null);
  const [eleveSearch, setEleveSearch] = useState(""); const [eleveFiltreClasse, setEleveFiltreClasse] = useState("");
  const [eleveSort, setEleveSort] = useState({ champ: "nom", dir: 1 });

  /* ---- Classes ---- */
  const [nouvelleClasseNiveau, setNouvelleClasseNiveau] = useState("");
  const [nouvelleClasseLibelle, setNouvelleClasseLibelle] = useState("");
  const [classeSelectionnee, setClasseSelectionnee] = useState(null);
  const [niveauConfigOuvert, setNiveauConfigOuvert] = useState(null);
  const [nouvellePeriodeNiveau, setNouvellePeriodeNiveau] = useState("");
  const [nouvelleTrancheNiveau, setNouvelleTrancheNiveau] = useState("");

  /* ---- Bulletin ---- */
  const [bulClasse, setBulClasse] = useState("cl1");
  const [bulTrimestre, setBulTrimestre] = useState("Trimestre 1");
  const [bulEleve, setBulEleve] = useState("");
  const [matiereForm, setMatiereForm] = useState(null);
  const [printAllView, setPrintAllView] = useState(false);

  /* ---- Saisie de notes ---- */
  const [saisieClasse, setSaisieClasse] = useState("cl1");
  const [ficheNotesView, setFicheNotesView] = useState(false);
  const [statSaisieClasse, setStatSaisieClasse] = useState("cl1");
  const [statSaisiePeriode, setStatSaisiePeriode] = useState("");
  const [resultatClasse, setResultatClasse] = useState("cl1");
  const [resultatAnnee, setResultatAnnee] = useState("");
  const [comptaAuthed, setComptaAuthed] = useState(false);
  const [comptaPwd, setComptaPwd] = useState(""); const [comptaErr, setComptaErr] = useState(false);
  const [resultatPeriode, setResultatPeriode] = useState("");
  const [satisfecitView, setSatisfecitView] = useState(false);
  const [attestationView, setAttestationView] = useState(false);

  /* ---- Matériels didactiques ---- */
  const [materielForm, setMaterielForm] = useState(null);
  const [materielFiltreClasse, setMaterielFiltreClasse] = useState("");

  /* ---- Comptabilité (+ Finance + Statistiques, sous contrôle du comptable) ---- */
  const [compTab, setCompTab] = useState("effectifs");
  const [paieClasseFiltre, setPaieClasseFiltre] = useState("");
  const [paieForm, setPaieForm] = useState({ studentId: "", trancheId: "", montant: "", mode: "Espèces" });
  const [recuId, setRecuId] = useState(null);
  const [staffForm, setStaffForm] = useState(null);
  const [paieAnnee, setPaieAnnee] = useState(new Date().getFullYear());
  const [rapportMoisIndex, setRapportMoisIndex] = useState(new Date().getMonth());
  const [rapportMoisAnnee, setRapportMoisAnnee] = useState(new Date().getFullYear());
  const [depForm, setDepForm] = useState({ categorie: "", montant: "", description: "" });
  const [suiviClasse, setSuiviClasse] = useState("cl1");
  const [suiviSort, setSuiviSort] = useState({ champ: "nom", dir: 1 });
  const [redevablesClasse, setRedevablesClasse] = useState("cl1");
  const [rappelClasse, setRappelClasse] = useState("cl1");
  const [anneeEnAttente, setAnneeEnAttente] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  /* ---------- Calculs ---------- */
  const classStats = (classeId) => {
    const l = students.filter(s => s.classeId === classeId);
    return { garcons: l.filter(s => s.sexe === "M").length, filles: l.filter(s => s.sexe === "F").length, total: l.length };
  };
  const niveauDe = (classeId) => { const c = classes.find(x => x.id === classeId); return c ? (c.niveau || c.nom) : null; };
  const DEFAUT_NIVEAU = { fraisAnnuel: 0, bareme: 20, periodes: ["Trimestre 1", "Trimestre 2", "Trimestre 3"] };
  const configNiveau = (niveau) => configNiveaux[niveau] || DEFAUT_NIVEAU;
  const studentPaid = (id) => paiements.filter(p => p.studentId === id).reduce((s, p) => s + Number(p.montant), 0);
  const studentAttendu = (s) => {
    if (s?.montantPersonnalise !== undefined && s?.montantPersonnalise !== null && s?.montantPersonnalise !== "") return Number(s.montantPersonnalise);
    return Number(configNiveau(niveauDe(s?.classeId)).fraisAnnuel || 0);
  };
  const studentReste = (s) => studentAttendu(s) - studentPaid(s.id);
  const totalEntrees = paiements.reduce((s, p) => { const el = students.find(x => x.id === p.studentId); return (!el || el.excluStats) ? s : s + Number(p.montant); }, 0);
  const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant), 0);
  const totalPaieVersee = paieHist.reduce((s, p) => staff.some(st => st.id === p.staffId) ? s + Number(p.montant) : s, 0);
  const bilan = totalEntrees - totalDepenses - totalPaieVersee;

  /* ---------- Actions Élèves / Classes ---------- */
  const saveEleve = () => {
    if (!eleveForm.prenoms || !eleveForm.nom) return;
    if (eleveForm.id) {
      const ancien = students.find(s => s.id === eleveForm.id);
      const changeDeNiveau = ancien && niveauDe(ancien.classeId) !== niveauDe(eleveForm.classeId);
      if (changeDeNiveau && !window.confirm(`Ce changement fait passer l'élève d'un niveau à un autre (${niveauDe(ancien.classeId)} → ${niveauDe(eleveForm.classeId)}).\n\nSes notes de l'ancien niveau seront définitivement supprimées. Continuer ?`)) return;
      if (changeDeNiveau) {
        setNotes(prev => prev.filter(n => n.studentId !== eleveForm.id));
        setConduites(prev => prev.filter(c => c.studentId !== eleveForm.id));
      }
      setStudents(prev => prev.map(s => s.id === eleveForm.id ? eleveForm : s));
    } else {
      setStudents(prev => [...prev, { ...eleveForm, id: uid("e") }]);
    }
    setEleveForm(null);
  };
  const deleteEleve = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setPaiements(prev => prev.filter(p => p.studentId !== id));
    setNotes(prev => prev.filter(n => n.studentId !== id));
    setConduites(prev => prev.filter(c => c.studentId !== id));
  };
  const importElevesCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lignes = parseCSV(e.target.result);
      if (lignes.length < 2) { window.alert("Fichier vide ou illisible."); return; }
      const entetes = lignes[0].map(h => h.trim().toLowerCase());
      const idx = (nom) => entetes.indexOf(nom);
      const iPrenoms = idx("prénoms"), iNom = idx("nom"), iSexe = idx("sexe"), iNaissance = idx("naissance"),
        iMatricule = idx("matricule"), iClasse = idx("classe"), iStatut = idx("statut"), iParent = idx("parent"), iTel = idx("téléphone");

      const nouveaux = []; const classesIntrouvables = new Set(); const dejaExistants = [];
      for (let i = 1; i < lignes.length; i++) {
        const l = lignes[i];
        if (!l.some(v => v && v.trim())) continue;
        const nomClasse = iClasse >= 0 ? (l[iClasse] || "").trim() : "";
        const classe = classes.find(c => c.nom.toLowerCase() === nomClasse.toLowerCase());
        if (nomClasse && !classe) classesIntrouvables.add(nomClasse);
        const matriculeLigne = iMatricule >= 0 ? (l[iMatricule] || "").trim() : "";
        if (matriculeLigne && students.some(s => s.matricule.trim().toLowerCase() === matriculeLigne.toLowerCase())) {
          dejaExistants.push(matriculeLigne);
          continue;
        }
        nouveaux.push({
          id: uid("e"),
          prenoms: iPrenoms >= 0 ? (l[iPrenoms] || "").trim() : "",
          nom: iNom >= 0 ? (l[iNom] || "").trim() : "",
          sexe: iSexe >= 0 && (l[iSexe] || "").trim().toUpperCase() === "M" ? "M" : "F",
          naissance: iNaissance >= 0 ? (l[iNaissance] || "").trim() : "",
          lieuNaissance: "",
          statut: iStatut >= 0 && (l[iStatut] || "").trim() ? l[iStatut].trim() : "Nouveau",
          matricule: matriculeLigne,
          classeId: classe ? classe.id : (classes[0]?.id || ""),
          parent: iParent >= 0 ? (l[iParent] || "").trim() : "",
          telephone: iTel >= 0 ? (l[iTel] || "").trim() : "",
          photo: null,
        });
      }
      if (!nouveaux.length && !dejaExistants.length) { window.alert("Aucun élève trouvé dans ce fichier."); return; }
      if (!nouveaux.length) { window.alert(`Rien à importer : tous les élèves de ce fichier existent déjà (${dejaExistants.length} ignoré(s), même matricule).`); return; }
      let msg = `${nouveaux.length} élève(s) prêt(s) à être importé(s).`;
      if (dejaExistants.length) msg += `\n\nIgnorés (déjà présents avec le même matricule, pour éviter un doublon) : ${dejaExistants.join(", ")}`;
      if (classesIntrouvables.size) msg += `\n\nAttention : ces classes n'existent pas exactement sous ce nom, les élèves concernés seront mis dans "${classes[0]?.nom}" par défaut (à corriger ensuite) : ${[...classesIntrouvables].join(", ")}`;
      if (!window.confirm(msg + "\n\nContinuer l'import ?")) return;
      setStudents(prev => [...prev, ...nouveaux]);
      window.alert(`${nouveaux.length} élève(s) importé(s) avec succès.`);
    };
    reader.readAsText(file, "UTF-8");
  };
  const importRegistreCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lignes = parseCSV(e.target.result);
      if (lignes.length < 2) { window.alert("Fichier vide ou illisible."); return; }
      const entetes = lignes[0].map(h => h.trim().toLowerCase());
      const iMatricule = entetes.indexOf("matricule");
      const iPaye = entetes.indexOf("montant total payé");
      if (iMatricule === -1 || iPaye === -1) { window.alert('Le fichier doit contenir au moins les colonnes "Matricule" et "Montant total payé".'); return; }

      const aCreer = []; const introuvables = []; const dejaExistants = [];
      for (let i = 1; i < lignes.length; i++) {
        const l = lignes[i];
        if (!l.some(v => v && v.trim())) continue;
        const matricule = (l[iMatricule] || "").trim();
        const montant = Number((l[iPaye] || "0").replace(/[^\d.-]/g, "")) || 0;
        const eleve = students.find(s => s.matricule.trim().toLowerCase() === matricule.toLowerCase());
        if (!eleve) { if (matricule) introuvables.push(matricule); continue; }
        if (studentPaid(eleve.id) > 0) { dejaExistants.push(`${eleve.prenoms} ${eleve.nom}`); continue; }
        if (montant > 0) aCreer.push({ id: uid("p"), studentId: eleve.id, trancheId: tranchesEcole[0]?.id || "", montant, date: today, mode: "Import (restauration)" });
      }

      let msg = `${aCreer.length} élève(s) vont recevoir un paiement de restauration correspondant au montant total importé.`;
      if (dejaExistants.length) msg += `\n\nIgnorés (ont déjà des paiements enregistrés, pour éviter un doublon) : ${dejaExistants.join(", ")}`;
      if (introuvables.length) msg += `\n\nMatricules introuvables : ${introuvables.join(", ")}`;
      if (!aCreer.length) { window.alert(msg || "Rien à importer."); return; }
      if (!window.confirm(msg + "\n\nContinuer l'import ?")) return;
      setPaiements(prev => [...prev, ...aCreer]);
      window.alert(`${aCreer.length} paiement(s) de restauration importé(s) avec succès.`);
    };
    reader.readAsText(file, "UTF-8");
  };
  const handlePhoto = (file) => {
    const reader = new FileReader();
    reader.onload = () => setEleveForm(f => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  };
  const addClasse = () => {
    if (!nouvelleClasseNiveau.trim()) return;
    const nom = nouvelleClasseLibelle.trim() ? `${nouvelleClasseNiveau.trim()} ${nouvelleClasseLibelle.trim()}` : nouvelleClasseNiveau.trim();
    setClasses(prev => [...prev, { id: uid("cl"), nom, niveau: nouvelleClasseNiveau.trim() }]);
    setNouvelleClasseLibelle("");
  };
  const configurerNiveauxStandards = () => {
    const niveauxExistants = new Set(classes.map(c => c.niveau || c.nom));
    const manquants = NIVEAUX_STANDARDS.filter(n => !niveauxExistants.has(n));
    if (!manquants.length) { window.alert("Tous les niveaux standards existent déjà."); return; }
    if (!window.confirm(`Créer les ${manquants.length} niveau(x) manquant(s) : ${manquants.join(", ")} ?\n\nLes niveaux déjà présents ne sont pas touchés.`)) return;
    setClasses(prev => [
      ...prev,
      ...manquants.map(n => ({ id: uid("cl"), nom: n, niveau: n })),
    ]);
  };
  const renameClasse = (id, nom) => setClasses(prev => prev.map(c => c.id === id ? { ...c, nom } : c));
  const setFraisNiveau = (niveau, montant) => setConfigNiveaux(prev => ({ ...prev, [niveau]: { ...configNiveau(niveau), fraisAnnuel: montant } }));
  const setBaremeNiveau = (niveau, bareme) => setConfigNiveaux(prev => ({ ...prev, [niveau]: { ...configNiveau(niveau), bareme } }));
  const addPeriodeNiveau = (niveau, nom) => {
    if (!nom.trim()) return;
    setConfigNiveaux(prev => ({ ...prev, [niveau]: { ...configNiveau(niveau), periodes: [...configNiveau(niveau).periodes, nom.trim()] } }));
  };
  const renamePeriodeNiveau = (niveau, index, val) => {
    const ancien = configNiveau(niveau).periodes[index];
    setConfigNiveaux(prev => ({ ...prev, [niveau]: { ...configNiveau(niveau), periodes: configNiveau(niveau).periodes.map((p, i) => i === index ? val : p) } }));
    if (ancien && ancien !== val) {
      const idsEleves = new Set(students.filter(s => niveauDe(s.classeId) === niveau).map(s => s.id));
      setNotes(prev => prev.map(n => (idsEleves.has(n.studentId) && n.trimestre === ancien) ? { ...n, trimestre: val } : n));
      setConduites(prev => prev.map(cd => (idsEleves.has(cd.studentId) && cd.trimestre === ancien) ? { ...cd, trimestre: val } : cd));
    }
  };
  const deletePeriodeNiveau = (niveau, index) => {
    const nom = configNiveau(niveau).periodes[index];
    const idsEleves = new Set(students.filter(s => niveauDe(s.classeId) === niveau).map(s => s.id));
    const aDesNotes = nom && notes.some(n => idsEleves.has(n.studentId) && n.trimestre === nom);
    if (aDesNotes && !window.confirm(`Des notes existent déjà pour "${nom}". Les supprimer de la liste des périodes les rendra inaccessibles (elles ne seront pas effacées, mais invisibles tant que "${nom}" n'est pas recréée à l'identique). Continuer ?`)) return;
    setConfigNiveaux(prev => ({ ...prev, [niveau]: { ...configNiveau(niveau), periodes: configNiveau(niveau).periodes.filter((_, i) => i !== index) } }));
  };
  const appliquerChangementAnnee = () => {
    const nouvelle = anneeEnAttente;
    if (!nouvelle || nouvelle === config.anneeScolaire) { setAnneeEnAttente(null); return; }
    const anneeQuittee = config.anneeScolaire;
    const donneesCibles = archives[nouvelle] || { notes: [], paiements: [], paieHist: [], depenses: [], materiels: [], studentClasses: null };

    // Étape 1 : mémoriser la classe de chaque élève telle qu'elle était durant l'année qu'on quitte, avant tout passage en classe supérieure
    const studentClassesQuittee = {};
    students.forEach(s => { studentClassesQuittee[s.id] = s.classeId; });
    setArchives(prev => ({ ...prev, [anneeQuittee]: { notes, paiements, paieHist, depenses, materiels, studentClasses: studentClassesQuittee } }));

    if (donneesCibles.studentClasses) {
      // On a déjà visité cette année auparavant : on restaure exactement la classe de chacun telle qu'elle était, sans recalculer.
      setStudents(prev => prev.map(s => donneesCibles.studentClasses[s.id] ? { ...s, classeId: donneesCibles.studentClasses[s.id] } : s));
    } else {
      // Première fois qu'on atteint cette année : on calcule le passage en classe supérieure selon la moyenne annuelle.
      const niveauxOrdonnes = [];
      classes.forEach(c => { const niv = c.niveau || c.nom; if (!niveauxOrdonnes.includes(niv)) niveauxOrdonnes.push(niv); });

      setStudents(prev => prev.map(s => {
        const cl = classes.find(c => c.id === s.classeId);
        if (!cl) return s;
        const niveauActuel = cl.niveau || cl.nom;
        const idxNiveau = niveauxOrdonnes.indexOf(niveauActuel);
        const moy = moyenneEleve(s.id, s.classeId, "ANNUEL");
        const admis = moy != null && (moy / (configNiveau(niveauActuel).bareme || 20) * 20) >= 10;
        if (admis && idxNiveau !== -1 && idxNiveau + 1 < niveauxOrdonnes.length) {
          const niveauSuivant = niveauxOrdonnes[idxNiveau + 1];
          const classeSuivante = classes.find(c => (c.niveau || c.nom) === niveauSuivant);
          if (classeSuivante) return { ...s, classeId: classeSuivante.id };
        }
        return s;
      }));
    }

    setNotes(donneesCibles.notes || []);
    setPaiements(donneesCibles.paiements || []);
    setPaieHist(donneesCibles.paieHist || []);
    setDepenses(donneesCibles.depenses || []);
    setMateriels(donneesCibles.materiels || []);
    setConfig(prev => ({ ...prev, anneeScolaire: nouvelle }));
    setAnneeEnAttente(null);
  };
  const deleteClasse = (id) => {
    const n = students.filter(s => s.classeId === id).length;
    if (n > 0) { window.alert(`Impossible de supprimer cette classe : ${n} élève(s) y sont encore inscrit(s). Déplacez-les d'abord vers une autre classe.`); return; }
    setClasses(prev => prev.filter(c => c.id !== id));
    if (classeSelectionnee === id) setClasseSelectionnee(null);
  };

  /* ---------- Actions Bulletin ---------- */
  const saveMatiere = (niveau) => {
    if (!matiereForm.nom || !matiereForm.coef) return;
    setMatieresConfig(prev => {
      const list = prev[niveau] || [];
      const updated = matiereForm.id ? list.map(m => m.id === matiereForm.id ? matiereForm : m) : [...list, { ...matiereForm, id: uid("mt") }];
      return { ...prev, [niveau]: updated };
    });
    setMatiereForm(null);
  };
  const deleteMatiere = (niveau, id) => {
    const idsEleves = new Set(students.filter(s => niveauDe(s.classeId) === niveau).map(s => s.id));
    const aDesNotes = notes.some(n => idsEleves.has(n.studentId) && n.matiereId === id);
    if (aDesNotes && !window.confirm("Des notes existent déjà pour cette matière. Les supprimer ne les efface pas de la base, mais elles deviendront invisibles (bulletin, saisie de notes) tant que cette matière n'est pas recréée à l'identique. Continuer ?")) return;
    setMatieresConfig(prev => ({ ...prev, [niveau]: (prev[niveau] || []).filter(m => m.id !== id) }));
  };
  const setNote = (studentId, matiereId, trimestre, value, bareme = 20) => {
    setNotes(prev => {
      const existing = prev.find(n => n.studentId === studentId && n.matiereId === matiereId && n.trimestre === trimestre);
      let val = value === "" ? null : Number(value);
      if (val != null && val > bareme) val = bareme;
      if (val != null && val < 0) val = 0;
      if (existing) return prev.map(n => n === existing ? { ...n, note: val } : n);
      return [...prev, { id: uid("n"), studentId, matiereId, trimestre, note: val }];
    });
  };
  const getConduite = (studentId, trimestre) => conduites.find(c => c.studentId === studentId && c.trimestre === trimestre)?.texte || "";
  const setConduiteTexte = (studentId, trimestre, texte) => {
    setConduites(prev => {
      const existing = prev.find(c => c.studentId === studentId && c.trimestre === trimestre);
      if (existing) return prev.map(c => c === existing ? { ...c, texte } : c);
      return [...prev, { id: uid("cd"), studentId, trimestre, texte }];
    });
  };
  const noteDe = (studentId, matiereId, trimestre) => {
    if (trimestre === "ANNUEL") {
      const classeIdEleve = students.find(s => s.id === studentId)?.classeId;
      const periodesClasse = configNiveau(niveauDe(classeIdEleve)).periodes;
      const vals = periodesClasse.map(per => notes.find(n => n.studentId === studentId && n.matiereId === matiereId && n.trimestre === per)?.note).filter(v => v != null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }
    return notes.find(n => n.studentId === studentId && n.matiereId === matiereId && n.trimestre === trimestre)?.note ?? null;
  };
  const rangMatiere = (matiereId, trimestre, studentId) => {
    const classeId = students.find(s => s.id === studentId)?.classeId;
    const eleves = students.filter(s => s.classeId === classeId);
    const valeurs = eleves.map(s => ({ id: s.id, v: noteDe(s.id, matiereId, trimestre) })).filter(x => x.v != null);
    const mine = valeurs.find(x => x.id === studentId)?.v;
    if (mine == null) return "—";
    const meilleurs = valeurs.filter(x => x.v > mine).length;
    const exaequo = valeurs.filter(x => x.v === mine).length > 1;
    const rang = meilleurs + 1;
    return `${rang}${rang === 1 ? "er" : "e"}${exaequo ? " exo" : ""}`;
  };
  const moyenneEleve = (studentId, classeId, trimestre) => {
    const mats = matieresConfig[niveauDe(classeId)] || [];
    let sc = 0, sp = 0;
    mats.forEach(m => {
      const n = noteDe(studentId, m.id, trimestre);
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
    const exaequo = classement.filter(x => x.moyenne === moy).length > 1;
    const rang = meilleurs + 1;
    return `${rang}${rang === 1 ? "er" : "e"}${exaequo ? " exo" : ""} / ${classement.length}`;
  };
  const appreciationGenerale = (moy, bareme = 20) => {
    if (moy == null) return "—";
    const r = moy / bareme * 20;
    return r >= 16 ? "Très Bien" : r >= 14 ? "Bien" : r >= 12 ? "Assez Bien" : r >= 10 ? "Passable" : "Insuffisant";
  };

  /* ---------- Actions Comptabilité / Finance ---------- */
  const addTrancheEcole = (nom) => {
    if (!nom.trim()) return;
    setTranchesEcole(prev => [...prev, { id: uid("tr"), nom: nom.trim(), limite: "" }]);
  };
  const renameTrancheEcole = (id, nom) => setTranchesEcole(prev => prev.map(t => t.id === id ? { ...t, nom } : t));
  const deleteTrancheEcole = (id) => {
    const aDesPaiements = paiements.some(p => p.trancheId === id);
    if (aDesPaiements && !window.confirm("Des paiements existent déjà pour cette tranche. La supprimer ne les efface pas, mais son nom n'apparaîtra plus. Continuer ?")) return;
    setTranchesEcole(prev => prev.filter(t => t.id !== id));
  };
  const enregistrerPaiement = () => {
    if (!paieForm.studentId || !paieForm.trancheId || !paieForm.montant) return;
    const el = students.find(s => s.id === paieForm.studentId);
    const reste = studentReste(el);
    if (Number(paieForm.montant) > reste) {
      window.alert(`Ce montant dépasse ce qui reste dû pour cet élève (${fmt(reste)} restant). Corrigez le montant avant d'enregistrer.`);
      return;
    }
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
  const deleteStaff = (id) => { setStaff(prev => prev.filter(s => s.id !== id)); setPaieHist(prev => prev.filter(p => p.staffId !== id)); };
  const dejaPayeMois = (staffId, moisLabel) => paieHist.some(p => p.staffId === staffId && p.mois === moisLabel);
  const payerMois = (s, moisLabel) => setPaieHist(prev => [...prev, { id: uid("ph"), staffId: s.id, mois: moisLabel, montant: s.salaire, date: today }]);
  const annulerPaieMois = (staffId, moisLabel) => { if (window.confirm("Annuler cette paie ? Elle redeviendra à payer.")) setPaieHist(prev => prev.filter(p => !(p.staffId === staffId && p.mois === moisLabel))); };
  const addDepense = () => {
    if (!depForm.categorie || !depForm.montant) return;
    if (depForm.id) {
      setDepenses(prev => prev.map(d => d.id === depForm.id ? { ...d, categorie: depForm.categorie, montant: Number(depForm.montant), description: depForm.description } : d));
    } else {
      setDepenses(prev => [...prev, { id: uid("d"), ...depForm, montant: Number(depForm.montant), date: today }]);
    }
    setDepForm({ categorie: "", montant: "", description: "" });
  };
  const deleteDepense = (id) => setDepenses(prev => prev.filter(d => d.id !== id));

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

  if (loadError) {
    return (
      <div className="f-body" style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        {FONTS}
        <div style={{ maxWidth: 420, textAlign: "center", background: "#fff", borderRadius: 14, padding: 30, border: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: C.text }}>Impossible de charger vos données</div>
          <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 18 }}>
            Rien n'a été modifié ni effacé — l'application a volontairement bloqué l'accès plutôt que de risquer d'afficher ou d'écraser vos vraies données. Vérifiez votre connexion internet, puis réessayez.
          </div>
          <button onClick={() => setRetryCount(c => c + 1)} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Réessayer</button>
          <div style={{ fontSize: 10.5, color: C.textSoft, marginTop: 14 }}>Détail technique : {loadError}</div>
        </div>
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
    { k: "statSaisies", label: "Stat. des saisies", icon: ClipboardCheck },
    { k: "bulletin", label: "Bulletin", icon: Award },
    { k: "resultats", label: "Résultats", icon: Trophy },
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
        <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ fontSize: 24, color: C.sage, fontWeight: 600 }}>{notes.filter(n => students.some(s => s.id === n.studentId)).length}</div><div style={{ fontSize: 11, color: C.textSoft }}>notes saisies</div></Card>
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
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#fff", fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer" }}>
              <Download size={13} style={{ transform: "rotate(180deg)" }} /> Importer CSV
              <input type="file" accept=".csv" style={{ display: "none" }} onChange={e => e.target.files[0] && importElevesCSV(e.target.files[0])} />
            </label>
            <Btn onClick={() => setEleveForm({ prenoms: "", nom: "", sexe: "F", naissance: "", lieuNaissance: "", statut: "Nouveau", matricule: "", classeId: classes[0]?.id || "", parent: "", telephone: "", photo: null })}><Plus size={13} /> Ajouter un élève</Btn>
          </div>
        </div>

        {eleveForm && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{eleveForm.id ? "Modifier l'élève" : "Nouvel élève"}</div>
              <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: C.textSoft, cursor: "pointer", lineHeight: 1 }}>
                <input type="checkbox" checked={!!eleveForm.excluStats} onChange={e => setEleveForm({ ...eleveForm, excluStats: e.target.checked })} style={{ width: 9, height: 9, margin: 0 }} />
              </label>
            </div>
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
                <div>
                  <Input type="number" min="0" placeholder="Montant annuel personnalisé" value={eleveForm.montantPersonnalise ?? ""} onChange={e => setEleveForm({ ...eleveForm, montantPersonnalise: e.target.value === "" ? null : e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
                  <div style={{ fontSize: 9.5, color: C.textSoft, marginTop: 2 }}>Boursier/exonéré : laissez vide sinon (0 = gratuit)</div>
                </div>
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
                  <Td>
                    <Pill_ text={s.statut || "Nouveau"} color={s.statut === "Ancien" ? C.brass : C.sage} bg={s.statut === "Ancien" ? C.brassSoft : C.sageSoft} />
                    {(s.montantPersonnalise !== undefined && s.montantPersonnalise !== null && s.montantPersonnalise !== "") && <span style={{ marginLeft: 4 }}><Pill_ text="Boursier" color={C.rose} bg={C.roseSoft} /></span>}
                  </Td>
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
        <div style={{ color: C.textSoft, fontSize: 13, marginBottom: 16 }}>Ajoutez autant de niveaux que nécessaire — aucune limite. Pour plusieurs sections d'un même niveau (ex : 1ère A, 1ère B, 1ère C), donnez-leur le même "Niveau" — le passage en classe supérieure s'appuiera dessus, pas sur le nom de la classe.</div>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Configuration rapide</div>
          <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Crée en un clic les niveaux manquants, dans l'ordre : {NIVEAUX_STANDARDS.join(" → ")}.</div>
          <Btn kind="brass" onClick={configurerNiveauxStandards}><Plus size={13} /> Configurer les 16 niveaux standards</Btn>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Année scolaire</div>
          <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Chaque année scolaire garde ses propres notes, paiements, salaires, dépenses et matériels — vous pouvez revenir sur une année passée à tout moment. Au passage à la nouvelle année, chaque élève admis (moyenne annuelle ≥ 10/20) passe automatiquement dans la classe suivante ; les élèves en échec restent dans leur classe actuelle.</div>
          <Select value={anneeEnAttente || config.anneeScolaire} onChange={e => setAnneeEnAttente(e.target.value)}>
            {ANNEES_SCOLAIRES.map(a => <option key={a} value={a}>{a}</option>)}
          </Select>

          {anneeEnAttente && anneeEnAttente !== config.anneeScolaire && (
            <div style={{ marginTop: 12, padding: 12, background: C.brassSoft, borderRadius: 8 }}>
              <div style={{ fontSize: 12.5, color: C.text, marginBottom: 8 }}>
                {archives[anneeEnAttente]
                  ? <>Revenir sur <b>{anneeEnAttente}</b> ? Les données de <b>{config.anneeScolaire}</b> seront mises de côté et celles de <b>{anneeEnAttente}</b> restaurées.</>
                  : <>Passer à <b>{anneeEnAttente}</b> ? Les données de <b>{config.anneeScolaire}</b> (notes, paiements, salaires, dépenses) seront archivées. Les élèves et les classes restent inchangés.</>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={appliquerChangementAnnee}><Check size={13} /> Confirmer le passage à {anneeEnAttente}</Btn>
                <Btn kind="ghost" onClick={() => setAnneeEnAttente(null)}><X size={13} /> Annuler</Btn>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12, padding: 10, background: C.paper, borderRadius: 8, fontSize: 11.5, color: C.textSoft }}>
            Contenu actuel de <b style={{ color: C.text }}>{config.anneeScolaire}</b> : {notes.length} note(s) · {paiements.length} paiement(s) · {paieHist.length} salaire(s) versé(s) · {depenses.length} dépense(s) · {materiels.length} matériel(s)
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Ajouter une classe (section)</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <Select value={nouvelleClasseNiveau} onChange={e => setNouvelleClasseNiveau(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
              <option value="">Choisir un niveau…</option>
              {[...new Set([...NIVEAUX_STANDARDS, ...classes.map(c => c.niveau || c.nom)])].map(n => <option key={n} value={n}>{n}</option>)}
            </Select>
            <Input placeholder="Libellé (ex : A, B, C — laisser vide si une seule section)" value={nouvelleClasseLibelle} onChange={e => setNouvelleClasseLibelle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addClasse()} style={{ flex: 1, minWidth: 200 }} />
            <Btn onClick={addClasse}><Plus size={13} /> Ajouter</Btn>
          </div>
          {classes.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: `1px solid ${C.line}`, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140, fontWeight: 600 }}>{c.nom}</div>
              <Input placeholder="Niveau (ex : 1ère)" value={c.niveau || ""} onChange={e => setClasses(prev => prev.map(x => x.id === c.id ? { ...x, niveau: e.target.value } : x))} style={{ width: 130 }} />
              <Input placeholder="Cycle (ex : Secondaire)" value={c.cycle || ""} onChange={e => setClasses(prev => prev.map(x => x.id === c.id ? { ...x, cycle: e.target.value } : x))} style={{ width: 150 }} />
              <span style={{ fontSize: 11, color: C.textSoft }}>{classStats(c.id).total} élève(s)</span>
              <Btn kind="ghost" onClick={() => setClasseSelectionnee(c.id)}>Voir la liste</Btn>
              <button onClick={() => deleteClasse(c.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Tranches de paiement</div>
          <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Configuration unique, commune à toute l'école (pas de montant propre — le montant se fixe par niveau ci-dessous).</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <Input placeholder="Ex : 1ère Tranche" value={nouvelleTrancheNiveau} onChange={e => setNouvelleTrancheNiveau(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { addTrancheEcole(nouvelleTrancheNiveau); setNouvelleTrancheNiveau(""); } }} style={{ flex: 1 }} />
            <Btn onClick={() => { addTrancheEcole(nouvelleTrancheNiveau); setNouvelleTrancheNiveau(""); }}><Plus size={13} /></Btn>
          </div>
          {tranchesEcole.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderTop: `1px solid ${C.line}` }}>
              <Input value={t.nom} onChange={e => renameTrancheEcole(t.id, e.target.value)} style={{ flex: 1 }} />
              <button onClick={() => deleteTrancheEcole(t.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Configuration pédagogique et financière par niveau</div>
          <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Un seul réglage par niveau s'applique automatiquement à toutes ses sections (1ère A, 1ère B, 1ère C…).</div>
          <Select value={niveauConfigOuvert || ""} onChange={e => setNiveauConfigOuvert(e.target.value || null)} style={{ marginBottom: 12 }}>
            <option value="">Choisir un niveau à configurer…</option>
            {[...new Set(classes.map(c => c.niveau || c.nom))].map(n => <option key={n} value={n}>{n}</option>)}
          </Select>

          {niveauConfigOuvert && (() => { const cfg = configNiveau(niveauConfigOuvert); return (
            <div style={{ background: C.paper, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11.5, color: C.textSoft, marginBottom: 10 }}>
                Sections concernées : <b>{classes.filter(c => (c.niveau || c.nom) === niveauConfigOuvert).map(c => c.nom).join(", ")}</b>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>Frais de scolarité annuel</div>
                  <Input type="number" min="0" value={cfg.fraisAnnuel} onChange={e => setFraisNiveau(niveauConfigOuvert, Number(e.target.value) || 0)} style={{ width: "100%", boxSizing: "border-box" }} />
                  <div style={{ fontSize: 10, color: C.textSoft, marginTop: 3 }}>{config.devise} — identique pour toutes les sections de ce niveau</div>

                  <div style={{ fontWeight: 700, fontSize: 12.5, margin: "14px 0 6px" }}>Barème</div>
                  <Input type="number" min="1" value={cfg.bareme} onChange={e => setBaremeNiveau(niveauConfigOuvert, Number(e.target.value) || 20)} style={{ width: 100 }} />

                  <div style={{ fontWeight: 700, fontSize: 12.5, margin: "14px 0 6px" }}>Trimestres / semestres</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <Input placeholder="Ex : Semestre 1" value={nouvellePeriodeNiveau} onChange={e => setNouvellePeriodeNiveau(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { addPeriodeNiveau(niveauConfigOuvert, nouvellePeriodeNiveau); setNouvellePeriodeNiveau(""); } }} style={{ flex: 1 }} />
                    <Btn onClick={() => { addPeriodeNiveau(niveauConfigOuvert, nouvellePeriodeNiveau); setNouvellePeriodeNiveau(""); }}><Plus size={13} /></Btn>
                  </div>
                  {cfg.periodes.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                      <Input value={p} onChange={e => renamePeriodeNiveau(niveauConfigOuvert, i, e.target.value)} style={{ flex: 1 }} />
                      <button onClick={() => deletePeriodeNiveau(niveauConfigOuvert, i)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={13} color={C.rose} /></button>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>Matières & coefficients</div>
                  <Btn onClick={() => setMatiereForm({ nom: "", coef: 1 })} style={{ marginBottom: 8 }}><Plus size={13} /> Ajouter une matière</Btn>
                  {matiereForm && (
                    <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                      <Input placeholder="Nom de la matière" value={matiereForm.nom} onChange={e => setMatiereForm({ ...matiereForm, nom: e.target.value })} />
                      <Input type="number" min="1" placeholder="Coefficient" value={matiereForm.coef} onChange={e => setMatiereForm({ ...matiereForm, coef: e.target.value })} style={{ width: 100 }} />
                      <Btn onClick={() => saveMatiere(niveauConfigOuvert)}><Check size={13} /></Btn>
                      <Btn kind="ghost" onClick={() => setMatiereForm(null)}><X size={13} /></Btn>
                    </div>
                  )}
                  {(matieresConfig[niveauConfigOuvert] || []).map(m => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: `1px solid ${C.line}` }}>
                      <div>{m.nom} <span className="f-mono" style={{ color: C.textSoft, fontSize: 11 }}>coef {m.coef}</span></div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setMatiereForm(m)} style={{ background: "none", border: "none", cursor: "pointer" }}><Pencil size={13} color={C.textSoft} /></button>
                        <button onClick={() => deleteMatiere(niveauConfigOuvert, m.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={13} color={C.rose} /></button>
                      </div>
                    </div>
                  ))}
                  {!(matieresConfig[niveauConfigOuvert] || []).length && <div style={{ fontSize: 11.5, color: C.textSoft }}>Aucune matière configurée.</div>}
                </div>
              </div>
            </div>
          ); })()}
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
    const niveauSaisie = niveauDe(saisieClasse);
    const matieres = matieresConfig[niveauSaisie] || [];
    const classeSaisie = classes.find(c => c.id === saisieClasse);
    const periodesClasse = configNiveau(niveauSaisie).periodes;
    const eleves = students.filter(s => s.classeId === saisieClasse).sort((a, b) => a.nom.localeCompare(b.nom));
    const noteA = (studentId, matiereId, periode) => notes.find(n => n.studentId === studentId && n.matiereId === matiereId && n.trimestre === periode)?.note ?? null;

    if (ficheNotesView) {
      return (
        <div>
          <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Btn kind="ghost" onClick={() => setFicheNotesView(false)}><X size={13} /> Fermer l'aperçu</Btn>
            <Btn onClick={() => window.print()}><Printer size={13} /> Imprimer</Btn>
          </div>
          <Card className="print-area">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
              <div style={{ fontSize: 11.5, lineHeight: 1.7, fontWeight: 700 }}>
                <div>{config.etablissement}</div>
                {config.etablissementAdresse && <div>{config.etablissementAdresse}</div>}
                {config.etablissementTels && <div>TÉLS : {config.etablissementTels}</div>}
                {config.ire && <div>IRE : {config.ire}</div>}
                {config.dpe && <div>DPE : {config.dpe}</div>}
              </div>
              <div style={{ width: 58, height: 58, borderRadius: "50%", border: `2px solid ${C.brass}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {config.logo ? <img src={config.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <GraduationCap size={24} color={C.brass} />}
              </div>
              <div style={{ fontSize: 11.5, lineHeight: 1.7, fontWeight: 700, textAlign: "right" }}>
                <div>RÉPUBLIQUE DE GUINÉE</div>
                <div style={{ fontWeight: 400, fontSize: 10.5 }}>Travail – Justice – Solidarité</div>
              </div>
            </div>

            <div className="f-display" style={{ textAlign: "center", fontWeight: 700, fontSize: 22, color: C.text, margin: "18px 0 14px", textTransform: "uppercase" }}>Fiche de notes</div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 16, fontWeight: 700 }}>
              <div>Classe : {classeSaisie?.nom}</div>
              <div>Matière : ……………………………………………………</div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, border: `1px solid ${C.text}` }}>
              <thead><tr>
                {["N°", "Prénoms et Nom", "Matricule", "Sexe", "MCours", "MCompo", "MG"].map(h => (
                  <th key={h} style={{ background: C.ink, color: "#fff", padding: "8px 6px", textAlign: h === "Prénoms et Nom" ? "left" : "center", fontSize: 11, textTransform: "uppercase", border: `1px solid ${C.ink}` }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {eleves.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ padding: "10px 6px", textAlign: "center", border: `1px solid ${C.line}` }}>{i + 1}</td>
                    <td style={{ padding: "10px 6px", fontWeight: 600, border: `1px solid ${C.line}` }}>{s.prenoms} {s.nom}</td>
                    <td className="f-mono" style={{ padding: "10px 6px", textAlign: "center", border: `1px solid ${C.line}` }}>{s.matricule}</td>
                    <td style={{ padding: "10px 6px", textAlign: "center", border: `1px solid ${C.line}` }}>{s.sexe}</td>
                    <td style={{ padding: "10px 6px", border: `1px solid ${C.line}` }}></td>
                    <td style={{ padding: "10px 6px", border: `1px solid ${C.line}` }}></td>
                    <td style={{ padding: "10px 6px", border: `1px solid ${C.line}` }}></td>
                  </tr>
                ))}
                {!eleves.length && <tr><td style={{ textAlign: "center", color: C.textSoft, padding: 10, border: `1px solid ${C.line}` }} colSpan={7}>Aucun élève dans cette classe.</td></tr>}
              </tbody>
            </table>
          </Card>
        </div>
      );
    }

    return (
      <div>
        <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600, marginBottom: 4 }}>Saisie de notes</div>
        <div style={{ color: C.textSoft, fontSize: 13, marginBottom: 16 }}>Sélectionnez une classe : chaque matière affiche une case par trimestre/semestre, toutes visibles en même temps — rien ne disparaît quand vous changez de période.</div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Select value={saisieClasse} onChange={e => setSaisieClasse(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
          <Btn kind="ghost" onClick={() => exportCSV(
            `notes-${classes.find(c => c.id === saisieClasse)?.nom}.csv`,
            ["Nom", "Matricule", ...matieres.flatMap(m => periodesClasse.map(p => `${m.nom} — ${p}`))],
            eleves.map(s => [`${s.prenoms} ${s.nom}`, s.matricule, ...matieres.flatMap(m => periodesClasse.map(p => noteA(s.id, m.id, p) ?? ""))])
          )}><Download size={13} /> Exporter vers Excel</Btn>
          <Btn kind="ghost" onClick={() => setFicheNotesView(true)}><Printer size={13} /> Imprimer fiche de notes vierge</Btn>
        </div>

        {!matieres.length ? (
          <Card><div style={{ fontSize: 12, color: C.textSoft }}>Aucune matière configurée pour cette classe. Rendez-vous dans le menu <b>Classes</b> (bouton "Configurer notes") pour ajouter les matières et coefficients de cette classe.</div></Card>
        ) : !periodesClasse.length ? (
          <Card><div style={{ fontSize: 12, color: C.textSoft }}>Aucune période (trimestre/semestre) configurée pour cette classe. Rendez-vous dans le menu <b>Classes</b> pour en ajouter.</div></Card>
        ) : (
          <Card style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, border: `1px solid ${C.text}` }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ background: C.ink, color: "#fff", padding: "8px 10px", textAlign: "left", fontSize: 11, textTransform: "uppercase", border: `1px solid ${C.ink}`, verticalAlign: "bottom" }}>Élève</th>
                  {matieres.map(m => (
                    <th key={m.id} colSpan={periodesClasse.length} style={{ background: C.ink, color: "#fff", padding: "6px 8px", textAlign: "center", fontSize: 11, textTransform: "uppercase", border: `1px solid ${C.ink}` }}>
                      {m.nom} <span style={{ fontWeight: 400, opacity: 0.85 }}>(coef {m.coef})</span>
                    </th>
                  ))}
                </tr>
                <tr>
                  {matieres.map(m => periodesClasse.map(p => (
                    <th key={m.id + p} style={{ background: C.inkDeep, color: "#fff", padding: "5px 6px", textAlign: "center", fontSize: 9.5, fontWeight: 500, border: `1px solid ${C.ink}` }}>{p}</th>
                  )))}
                </tr>
              </thead>
              <tbody>
                {eleves.map((s, i) => (
                  <tr key={s.id} style={{ background: i % 2 ? C.paper : "#fff" }}>
                    <td style={{ padding: "7px 10px", fontWeight: 600, whiteSpace: "nowrap", border: `1px solid ${C.line}` }}>{s.prenoms} {s.nom}<div className="f-mono" style={{ fontWeight: 400, fontSize: 10.5, color: C.textSoft }}>Matricule : {s.matricule}</div></td>
                    {matieres.map(m => periodesClasse.map(p => (
                      <td key={m.id + p} style={{ padding: "4px 5px", textAlign: "center", border: `1px solid ${C.line}` }}>
                        <input type="number" min="0" max={configNiveau(niveauSaisie).bareme} step="0.5" value={noteA(s.id, m.id, p) ?? ""} placeholder="—"
                          onChange={e => setNote(s.id, m.id, p, e.target.value, configNiveau(niveauSaisie).bareme)}
                          style={{ width: 42, textAlign: "center", padding: "3px 2px", borderRadius: 5, border: `1px solid ${C.line}`, fontSize: 11.5 }} />
                      </td>
                    )))}
                  </tr>
                ))}
                {!eleves.length && <tr><td style={{ textAlign: "center", color: C.textSoft, padding: "10px", border: `1px solid ${C.line}` }} colSpan={matieres.length * periodesClasse.length + 1}>Aucun élève dans cette classe.</td></tr>}
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

  /* ----- Résultats (classement imprimable, par classe / période / année) ----- */
  const renderResultats = () => {
    const classeR = classes.find(c => c.id === resultatClasse);
    const niveauR = niveauDe(resultatClasse);
    const bareme = configNiveau(niveauR).bareme;
    const periodesClasse = configNiveau(niveauR).periodes;
    const anneeChoisie = resultatAnnee || config.anneeScolaire;
    const periodeChoisie = resultatPeriode || periodesClasse[0] || "ANNUEL";
    const anneesDisponibles = [config.anneeScolaire, ...Object.keys(archives)].filter((v, i, a) => a.indexOf(v) === i);
    const notesSource = anneeChoisie === config.anneeScolaire ? notes : (archives[anneeChoisie]?.notes || []);
    const matieres = matieresConfig[niveauR] || [];

    const noteDeSrc = (studentId, matiereId, trimestre) => {
      if (trimestre === "ANNUEL") {
        const vals = periodesClasse.map(per => notesSource.find(n => n.studentId === studentId && n.matiereId === matiereId && n.trimestre === per)?.note).filter(v => v != null);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      }
      return notesSource.find(n => n.studentId === studentId && n.matiereId === matiereId && n.trimestre === trimestre)?.note ?? null;
    };
    const moyenneDe = (studentId) => {
      let sc = 0, sp = 0;
      matieres.forEach(m => { const n = noteDeSrc(studentId, m.id, periodeChoisie); if (n != null) { sc += Number(m.coef); sp += n * Number(m.coef); } });
      return sc ? sp / sc : null;
    };

    const eleves = students.filter(s => s.classeId === resultatClasse);
    const resultats = eleves.map(s => ({ student: s, moyenne: moyenneDe(s.id) }))
      .sort((a, b) => { if (a.moyenne == null) return 1; if (b.moyenne == null) return -1; return b.moyenne - a.moyenne; });

    const garcons = eleves.filter(s => s.sexe === "M");
    const filles = eleves.filter(s => s.sexe === "F");
    const estAdmis = (s) => { const m = moyenneDe(s.id); return m != null && (m / bareme * 20) >= 10; };
    const admisG = garcons.filter(estAdmis).length;
    const admisF = filles.filter(estAdmis).length;
    const tauxG = garcons.length ? Math.round(admisG / garcons.length * 100) : 0;
    const tauxF = filles.length ? Math.round(admisF / filles.length * 100) : 0;
    const tauxTotal = eleves.length ? Math.round((admisG + admisF) / eleves.length * 100) : 0;

    const resultatsAvecRang = resultats.map(r => {
      const rang = r.moyenne != null ? resultats.filter(x => x.moyenne != null && x.moyenne > r.moyenne).length + 1 : null;
      return { ...r, rang };
    });
    const top3 = resultatsAvecRang.filter(r => r.rang != null && r.rang <= 3);
    const estGrandeSection = /grande section/i.test(niveauR || "");
    const admisAttestation = resultatsAvecRang.filter(r => r.moyenne != null && (r.moyenne / bareme * 20) >= 10);

    const renderAttestationEleve = (r) => (
      <div style={{ border: `4px double ${C.ink}`, borderRadius: 6, padding: "36px 46px", background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 62, height: 62, borderRadius: "50%", border: `2px solid ${C.brass}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {config.logo ? <img src={config.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <GraduationCap size={28} color={C.brass} />}
            </div>
            <div>
              <div className="f-display" style={{ fontSize: 19, fontWeight: 700, color: C.text, lineHeight: 1.25 }}>ATTESTATION DE FIN DE CYCLE</div>
              <div className="f-display" style={{ fontSize: 14, fontWeight: 700, color: C.brass, letterSpacing: 1 }}>PRÉSCOLAIRE</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textAlign: "right", lineHeight: 1.6, whiteSpace: "nowrap" }}>
              <div>RÉPUBLIQUE DE GUINÉE</div>
              <div style={{ fontWeight: 400, fontSize: 9.5 }}>Travail – Justice – Solidarité</div>
            </div>
            <div style={{ width: 64, height: 76, border: `1px solid ${C.text}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {r.student.photo ? <img src={r.student.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 8.5, color: C.textSoft }}>PHOTO</span>}
            </div>
          </div>
        </div>

        <div style={{ background: C.ink, color: "#fff", textAlign: "center", padding: "10px 0", fontWeight: 700, fontSize: 13.5, letterSpacing: 0.5, margin: "26px 0 24px", borderRadius: 3 }}>NOUS ATTESTONS QUE L'ÉLÈVE</div>

        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div className="f-display" style={{ fontSize: 27, fontWeight: 700, color: C.text, textTransform: "uppercase" }}>{r.student.prenoms} {r.student.nom}</div>
          <div className="f-mono" style={{ fontSize: 11.5, color: C.textSoft, marginTop: 3 }}>Matricule : {r.student.matricule}</div>
        </div>

        <div style={{ fontSize: 13.5, lineHeight: 2, color: C.text, textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          A terminé(e) avec succès sa formation de préscolaire au sein de notre établissement le <b>{config.etablissement}</b>, et est admis(e) pour poursuivre ses études au cycle élémentaire.
          <br /><br />
          En foi de quoi nous lui décernons cette attestation pour servir et valoir ce que de droit.
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 70 }}>
          <div style={{ textAlign: "center", fontSize: 11 }}>
            <div style={{ width: 160, borderTop: `1px solid ${C.text}`, marginBottom: 4 }} />
            Date
          </div>
          <div style={{ textAlign: "center", fontSize: 11 }}>
            <div style={{ width: 200, borderTop: `1px solid ${C.text}`, marginBottom: 4 }} />
            Signature du chef de l'établissement
            {config.responsable && <div style={{ fontWeight: 700, marginTop: 2 }}>{config.responsable}</div>}
            {config.etablissementTels && <div>Tél : {config.etablissementTels}</div>}
          </div>
        </div>
      </div>
    );

    if (attestationView) {
      return (
        <div>
          <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Btn kind="ghost" onClick={() => setAttestationView(false)}><X size={13} /> Fermer l'aperçu</Btn>
            <Btn onClick={() => window.print()}><Printer size={13} /> Imprimer les attestations</Btn>
          </div>
          {!admisAttestation.length && <Card><div style={{ fontSize: 12, color: C.textSoft }}>Aucun élève admis (moyenne annuelle manquante) pour cette classe.</div></Card>}
          {admisAttestation.map((r, i) => (
            <div key={r.student.id} className="print-area" style={{ pageBreakAfter: i < admisAttestation.length - 1 ? "always" : "auto", marginBottom: 16 }}>
              {renderAttestationEleve(r)}
            </div>
          ))}
        </div>
      );
    }

    const renderSatisfecitEleve = (r) => (
      <div style={{ border: `3px double ${C.brass}`, borderRadius: 6, padding: "50px 40px", textAlign: "center", background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${C.brass}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {config.logo ? <img src={config.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <GraduationCap size={28} color={C.brass} />}
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{config.etablissement}</div>
        <div style={{ fontSize: 10.5, color: C.textSoft }}>
          {[config.etablissementAdresse, config.etablissementTels].filter(Boolean).join(" · ")}
        </div>
        <div style={{ fontSize: 10.5, letterSpacing: 3, color: C.textSoft, marginTop: 18 }}>ANNÉE SCOLAIRE {anneeChoisie}</div>
        <div className="f-display" style={{ fontSize: 36, fontWeight: 700, color: C.ink, margin: "18px 0 6px", letterSpacing: 4 }}>SATISFECIT</div>
        <div style={{ width: 110, height: 2, background: C.brass, margin: "0 auto 26px" }} />
        <div style={{ fontSize: 12.5, color: C.textSoft }}>Ce prix d'excellence est décerné à</div>
        <div className="f-display" style={{ fontSize: 25, fontWeight: 700, margin: "8px 0 6px", textTransform: "uppercase" }}>{r.student.prenoms} {r.student.nom}</div>
        <div className="f-mono" style={{ fontSize: 11.5, color: C.textSoft, marginBottom: 18 }}>Matricule : {r.student.matricule}</div>
        <div style={{ fontSize: 13, lineHeight: 1.9, maxWidth: 620, margin: "0 auto", color: C.text }}>
          Élève de la classe <b>{classeR?.nom}</b>, classé <b>{r.rang}{r.rang === 1 ? "er" : "e"}</b>, Moyenne Générale de <b>{r.moyenne.toFixed(2)} / {bareme}</b>, pour son brillant parcours académique au cours de l'année scolaire : <b>{anneeChoisie}</b>.
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 60 }}>
          <div style={{ fontSize: 10.5, color: C.textSoft }}>Fait le {new Date().toLocaleDateString("fr-FR")}</div>
          <div style={{ textAlign: "center", fontSize: 11, color: C.textSoft }}>
            <div style={{ width: 170, borderTop: `1px solid ${C.text}`, marginBottom: 4 }} />
            Le Chef d'établissement
          </div>
        </div>
      </div>
    );

    if (satisfecitView) {
      return (
        <div>
          <style>{`@media print { @page { size: landscape; } }`}</style>
          <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Btn kind="ghost" onClick={() => setSatisfecitView(false)}><X size={13} /> Fermer l'aperçu</Btn>
            <Btn onClick={() => window.print()}><Printer size={13} /> Imprimer les satisfécits</Btn>
          </div>
          {!top3.length && <Card><div style={{ fontSize: 12, color: C.textSoft }}>Aucun élève classé (moyenne annuelle manquante) pour cette classe.</div></Card>}
          {top3.map((r, i) => (
            <div key={r.student.id} className="print-area" style={{ pageBreakAfter: i < top3.length - 1 ? "always" : "auto", marginBottom: 16 }}>
              {renderSatisfecitEleve(r)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div>
        <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600, marginBottom: 4 }}>Résultats</div>
        <div style={{ color: C.textSoft, fontSize: 13, marginBottom: 16 }}>Classement imprimable de la classe, par trimestre, semestre ou en annuel.</div>

        <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Select value={resultatClasse} onChange={e => { setResultatClasse(e.target.value); setResultatPeriode(""); }}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
          <Select value={anneeChoisie} onChange={e => setResultatAnnee(e.target.value)}>{anneesDisponibles.map(a => <option key={a} value={a}>{a}</option>)}</Select>
          <Select value={periodeChoisie} onChange={e => setResultatPeriode(e.target.value)}>
            {periodesClasse.map(p => <option key={p} value={p}>{p}</option>)}
            <option value="ANNUEL">Annuel (moyenne des périodes)</option>
          </Select>
          <Btn kind="ghost" onClick={() => window.print()}><Printer size={13} /> Imprimer</Btn>
          {periodeChoisie === "ANNUEL" && !estGrandeSection && (
            <Btn kind="brass" onClick={() => setSatisfecitView(true)}><Award size={13} /> Générer les satisfécits (Top 3)</Btn>
          )}
          {periodeChoisie === "ANNUEL" && estGrandeSection && (
            <Btn kind="brass" onClick={() => setAttestationView(true)}><Award size={13} /> Générer les attestations (admis)</Btn>
          )}
        </div>

        {anneeChoisie !== config.anneeScolaire && (
          <div className="no-print" style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>Année archivée : les notes affichées sont celles de {anneeChoisie}, mais la liste des élèves reflète leur classe actuelle.</div>
        )}

        <Card className="print-area">
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

          <div className="f-display" style={{ textAlign: "center", fontWeight: 700, fontSize: 17, color: C.text, margin: "14px 0 2px", textTransform: "uppercase" }}>
            Rapport du {periodeChoisie === "ANNUEL" ? "Bilan Annuel" : periodeChoisie}
          </div>
          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Année Scolaire : {anneeChoisie}</div>
          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Classe : {classeR?.nom}</div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, border: `1px solid ${C.text}` }}>
            <thead><tr>
              {["Rang", "Prénoms et Nom", "Matricule", "Moyenne Générale", "Appréciation"].map(h => (
                <th key={h} style={{ background: C.ink, color: "#fff", padding: "7px 8px", textAlign: h === "Prénoms et Nom" ? "left" : "center", fontSize: 11, textTransform: "uppercase", border: `1px solid ${C.ink}` }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {resultats.map(r => {
                const rang = r.moyenne != null ? resultats.filter(x => x.moyenne != null && x.moyenne > r.moyenne).length + 1 : null;
                const exaequo = r.moyenne != null && resultats.filter(x => x.moyenne === r.moyenne).length > 1;
                return (
                  <tr key={r.student.id}>
                    <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, border: `1px solid ${C.line}` }}>{rang != null ? `${rang}${rang === 1 ? "er" : "e"}${exaequo ? " exo" : ""}` : "—"}</td>
                    <td style={{ padding: "6px 8px", fontWeight: 600, border: `1px solid ${C.line}` }}>{r.student.prenoms} {r.student.nom}</td>
                    <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{r.student.matricule}</td>
                    <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, border: `1px solid ${C.line}` }}>{r.moyenne != null ? r.moyenne.toFixed(2) : "—"} / {bareme}</td>
                    <td style={{ padding: "6px 8px", border: `1px solid ${C.line}` }}>{appreciationGenerale(r.moyenne, bareme)}</td>
                  </tr>
                );
              })}
              {!resultats.length && <tr><td style={{ textAlign: "center", color: C.textSoft, padding: 10, border: `1px solid ${C.line}` }} colSpan={5}>Aucun élève dans cette classe.</td></tr>}
            </tbody>
          </table>

          <div className="f-display" style={{ fontWeight: 700, fontSize: 13, margin: "20px 0 8px" }}>Statistiques de la classe</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, border: `1px solid ${C.text}` }}>
            <thead><tr>
              {["", "Garçons", "Filles", "Total"].map(h => (
                <th key={h} style={{ background: C.ink, color: "#fff", padding: "7px 8px", textAlign: "center", fontSize: 11, textTransform: "uppercase", border: `1px solid ${C.ink}` }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              <tr>
                <td style={{ padding: "6px 8px", fontWeight: 700, border: `1px solid ${C.line}` }}>Effectif</td>
                <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{garcons.length}</td>
                <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{filles.length}</td>
                <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, border: `1px solid ${C.line}` }}>{eleves.length}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 8px", fontWeight: 700, border: `1px solid ${C.line}` }}>Taux d'admission</td>
                <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{tauxG}%</td>
                <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{tauxF}%</td>
                <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, border: `1px solid ${C.line}` }}>{tauxTotal}%</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    );
  };

  /* ----- Statistiques des saisies (repérer les notes manquantes ou à 0) ----- */
  const renderStatSaisies = () => {
    const niveauStat = niveauDe(statSaisieClasse);
    const matieres = matieresConfig[niveauStat] || [];
    const periodesClasse = configNiveau(niveauStat).periodes;
    const periodeChoisie = statSaisiePeriode || periodesClasse[0] || "";
    const eleves = students.filter(s => s.classeId === statSaisieClasse).sort((a, b) => a.nom.localeCompare(b.nom));

    const analyse = eleves.map(s => {
      const problemes = matieres.map(m => {
        const n = notes.find(x => x.studentId === s.id && x.matiereId === m.id && x.trimestre === periodeChoisie)?.note;
        if (n == null) return { matiere: m.nom, etat: "manquante" };
        if (n === 0) return { matiere: m.nom, etat: "à 0" };
        return null;
      }).filter(Boolean);
      return { student: s, problemes };
    });
    const complets = analyse.filter(a => !a.problemes.length);
    const incomplets = analyse.filter(a => a.problemes.length);

    return (
      <div>
        <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600, marginBottom: 4 }}>Statistiques des saisies</div>
        <div style={{ color: C.textSoft, fontSize: 13, marginBottom: 16 }}>Repère les élèves dont toutes les notes de la période sont saisies et différentes de zéro dans toutes les matières.</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Select value={statSaisieClasse} onChange={e => { setStatSaisieClasse(e.target.value); setStatSaisiePeriode(""); }}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
          <Select value={periodeChoisie} onChange={e => setStatSaisiePeriode(e.target.value)}>{periodesClasse.map(p => <option key={p} value={p}>{p}</option>)}</Select>
        </div>

        {!matieres.length ? (
          <Card><div style={{ fontSize: 12, color: C.textSoft }}>Aucune matière configurée pour ce niveau (menu Classes → Configurer notes).</div></Card>
        ) : !periodeChoisie ? (
          <Card><div style={{ fontSize: 12, color: C.textSoft }}>Aucune période configurée pour ce niveau.</div></Card>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
              <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ fontSize: 24, color: C.sage, fontWeight: 600 }}>{complets.length}</div><div style={{ fontSize: 11, color: C.textSoft }}>élèves avec saisie complète</div></Card>
              <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ fontSize: 24, color: C.rose, fontWeight: 600 }}>{incomplets.length}</div><div style={{ fontSize: 11, color: C.textSoft }}>élèves avec au moins un problème</div></Card>
              <Card style={{ textAlign: "center" }}><div className="f-mono" style={{ fontSize: 24, color: C.ink, fontWeight: 600 }}>{eleves.length}</div><div style={{ fontSize: 11, color: C.textSoft }}>effectif de la classe</div></Card>
            </div>

            <div className="f-display" style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Élèves avec des notes manquantes ou à 0</div>
            {!incomplets.length ? (
              <Card><div style={{ fontSize: 12.5, color: C.sage, fontWeight: 600 }}>Aucun problème — toutes les notes sont saisies et différentes de zéro pour cette période.</div></Card>
            ) : incomplets.map(a => (
              <Card key={a.student.id}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{a.student.prenoms} {a.student.nom} <span className="f-mono" style={{ fontWeight: 400, fontSize: 11, color: C.textSoft }}>({a.student.matricule})</span></div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {a.problemes.map((p, i) => (
                    <Pill_ key={i} text={`${p.matiere} : ${p.etat}`} color={p.etat === "manquante" ? C.brass : C.rose} bg={p.etat === "manquante" ? C.brassSoft : C.roseSoft} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ----- Bulletin (au choix du responsable) ----- */
  const renderBulletinEleve = (studentId) => {
    const eleve = students.find(s => s.id === studentId);
    if (!eleve) return null;
    const classeId = eleve.classeId;
    const classeEleve = classes.find(c => c.id === classeId);
    const niveauEleve = niveauDe(classeId);
    const bareme = configNiveau(niveauEleve).bareme;
    const periodesClasse = configNiveau(niveauEleve).periodes;
    const estAnnuel = bulTrimestre === "ANNUEL";
    const matieres = matieresConfig[niveauEleve] || [];
    const noteOf = (matiereId) => noteDe(studentId, matiereId, bulTrimestre);
    let sommeCoef = 0, sommePondere = 0;
    matieres.forEach(m => { const n = noteOf(m.id); if (n != null) { sommeCoef += Number(m.coef); sommePondere += n * Number(m.coef); } });
    const moyenne = sommeCoef ? (sommePondere / sommeCoef) : null;

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

        <div className="f-display" style={{ textAlign: "center", fontWeight: 700, fontSize: 17, color: C.text, margin: "14px 0 2px", textTransform: "uppercase" }}>Bulletin de notes — {estAnnuel ? "Annuel" : bulTrimestre}</div>
        {config.anneeScolaire && <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Année Scolaire : {config.anneeScolaire}</div>}

        <div style={{ border: `1px solid ${C.text}`, padding: 10, marginBottom: 12, fontSize: 12.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <span><b>NOM ET PRÉNOMS :</b> {eleve.nom} {eleve.prenoms}</span>
            <span><b>CLASSE :</b> {classeEleve?.nom}</span>
          </div>
          <div style={{ marginTop: 4 }}><b>MATRICULE :</b> <span className="f-mono">{eleve.matricule}</span></div>
          <div style={{ marginTop: 4 }}><b>DATE ET LIEU DE NAISSANCE :</b> {eleve.naissance}{eleve.lieuNaissance ? ` à ${eleve.lieuNaissance}` : ""}</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, border: `1px solid ${C.text}` }}>
          <thead><tr>
            {["Matière", ...(estAnnuel ? periodesClasse : []), estAnnuel ? "Moyenne" : "Moy", "Coeff", "Moy Coeff", "Rang", "Appréciation"].map((h, i) => (
              <th key={h + i} style={{ background: C.ink, color: "#fff", padding: "7px 8px", textAlign: (i === 0 || h === "Appréciation") ? "left" : "center", fontSize: 11, textTransform: "uppercase", border: `1px solid ${C.ink}` }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {matieres.map(m => {
              const n = noteOf(m.id);
              return (
                <tr key={m.id}>
                  <td style={{ padding: "6px 8px", fontWeight: 600, border: `1px solid ${C.line}` }}>{m.nom}</td>
                  {estAnnuel && periodesClasse.map(per => {
                    const val = notes.find(x => x.studentId === studentId && x.matiereId === m.id && x.trimestre === per)?.note;
                    return <td key={per} className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}`, color: C.textSoft }}>{val != null ? val : "—"}</td>;
                  })}
                  <td style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>
                    {estAnnuel
                      ? <span className="f-mono" style={{ fontWeight: 700 }}>{n != null ? n.toFixed(1).replace(/\.0$/, "") : "—"}</span>
                      : <input type="number" min="0" max={bareme} step="0.5" value={n ?? ""} placeholder="—"
                          onChange={e => setNote(studentId, m.id, bulTrimestre, e.target.value, bareme)}
                          style={{ width: 50, textAlign: "center", padding: "3px 4px", borderRadius: 6, border: `1px solid ${C.line}`, fontSize: 12.5 }} />}
                  </td>
                  <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{m.coef}</td>
                  <td className="f-mono" style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{n != null ? (n * m.coef).toFixed(1).replace(/\.0$/, "") : "—"}</td>
                  <td style={{ padding: "6px 8px", textAlign: "center", border: `1px solid ${C.line}` }}>{rangMatiere(m.id, bulTrimestre, studentId)}</td>
                  <td style={{ padding: "6px 8px", border: `1px solid ${C.line}` }}>{mention(n, bareme)}</td>
                </tr>
              );
            })}
            <tr style={{ background: C.ink, color: "#fff", fontWeight: 700 }}>
              <td style={{ padding: "7px 8px", border: `1px solid ${C.ink}` }}>TOTAL</td>
              {estAnnuel && periodesClasse.map(per => <td key={per} style={{ border: `1px solid ${C.ink}` }}></td>)}
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
            <td className="f-mono" style={{ padding: "8px 10px", border: `1px solid ${C.line}`, fontWeight: 700 }}>{moyenne != null ? moyenne.toFixed(2) : "—"} / {bareme}</td>
            <td style={{ background: C.ink, color: "#fff", fontWeight: 700, padding: "8px 10px" }}>RANG</td>
            <td className="f-mono" style={{ padding: "8px 10px", border: `1px solid ${C.line}`, fontWeight: 700 }}>{rangGeneral(studentId, classeId, bulTrimestre)}</td>
            <td style={{ background: C.ink, color: "#fff", fontWeight: 700, padding: "8px 10px" }}>APPRÉCIATION</td>
            <td style={{ padding: "8px 10px", border: `1px solid ${C.line}`, fontWeight: 700 }}>{appreciationGenerale(moyenne, bareme)}</td>
          </tr></tbody>
        </table>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>Conduite et recommandations de suivi</div>
          <textarea value={getConduite(studentId, bulTrimestre)} onChange={e => setConduiteTexte(studentId, bulTrimestre, e.target.value)}
            placeholder="Remarques sur la conduite de l'élève, recommandations…" rows={2}
            style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: 6, padding: 8, fontSize: 12.5, fontFamily: "'Public Sans',sans-serif", resize: "vertical" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 30 }}>
          <div style={{ textAlign: "center", fontSize: 11, color: C.textSoft }}>
            <div style={{ width: 180, borderTop: `1px solid ${C.text}`, marginBottom: 4 }} />
            Signature du chef d'établissement
          </div>
        </div>

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

    const niveauBul = niveauDe(bulClasse);
    const matieres = matieresConfig[niveauBul] || [];
    const classeBul = classes.find(c => c.id === bulClasse);
    const periodesClasse = configNiveau(niveauBul).periodes;
    const classeEleves = students.filter(s => s.classeId === bulClasse);
    const classement = classementClasse(bulClasse, bulTrimestre);

    return (
      <div>
        <div className="f-display" style={{ fontSize: 22, color: C.text, fontWeight: 600, marginBottom: 4 }}>Bulletin — configuration du responsable</div>
        <div style={{ color: C.textSoft, fontSize: 13, marginBottom: 16 }}>Bulletin par trimestre, calculé automatiquement à partir des matières et coefficients configurés pour chaque classe (menu Classes).</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Select value={bulClasse} onChange={e => { setBulClasse(e.target.value); setBulEleve(""); setBulTrimestre(configNiveau(niveauDe(e.target.value)).periodes[0] || "ANNUEL"); }}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
          <Select value={bulTrimestre} onChange={e => setBulTrimestre(e.target.value)}>
            {periodesClasse.map(t => <option key={t} value={t}>{t}</option>)}
            <option value="ANNUEL">Bulletin annuel (moyenne des périodes)</option>
          </Select>
          <Select value={bulEleve} onChange={e => setBulEleve(e.target.value)}><option value="">Voir un bulletin individuel…</option>{classeEleves.map(s => <option key={s.id} value={s.id}>{nomMat(s)}</option>)}</Select>
        </div>

        <Card className="no-print">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Configuration de l'établissement</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
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
              <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 4 }}>Titre et nom du/de la responsable (ex : La Directrice Fanta Kaba)</div>
              <Input value={config.responsable || ""} onChange={e => setConfig({ ...config, responsable: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: 10.5, color: C.textSoft, marginTop: 10 }}>Le barème, les matières/coefficients et les trimestres/semestres de chaque classe se configurent désormais dans le menu <b>Classes</b> (bouton "Configurer notes").</div>
        </Card>

        <Card className="no-print">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}><ListOrdered size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />Classement — {classes.find(c => c.id === bulClasse)?.nom} ({bulTrimestre === "ANNUEL" ? "Annuel" : bulTrimestre})</div>
            <Btn onClick={() => setPrintAllView(true)}><Printer size={13} /> Imprimer tous les bulletins de la classe</Btn>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Rang</Th><Th>Élève</Th><Th>Moyenne</Th><Th>Mention</Th></tr></thead>
            <tbody>
              {classement.map((c, i) => {
                const rangReel = c.moyenne != null ? classement.filter(x => x.moyenne != null && x.moyenne > c.moyenne).length + 1 : null;
                const exaequo = c.moyenne != null && classement.filter(x => x.moyenne === c.moyenne).length > 1;
                return (
                  <tr key={c.student.id} onClick={() => setBulEleve(c.student.id)} style={{ cursor: "pointer" }}>
                    <Td style={{ fontWeight: 700 }}>{rangReel != null ? `${rangReel}${rangReel === 1 ? "er" : "e"}${exaequo ? " exo" : ""}` : "—"}</Td>
                    <Td style={{ fontWeight: 600 }}>{c.student.prenoms} {c.student.nom}<div className="f-mono" style={{ fontWeight: 400, fontSize: 10.5, color: C.textSoft }}>Matricule : {c.student.matricule}</div></Td>
                    <Td className="f-mono">{c.moyenne != null ? c.moyenne.toFixed(2) : "—"}</Td>
                    <Td><Pill_ text={mention(c.moyenne, configNiveau(niveauBul).bareme)} color={c.moyenne >= 12 ? C.sage : c.moyenne >= 10 ? C.brass : C.rose} bg={c.moyenne >= 12 ? C.sageSoft : c.moyenne >= 10 ? C.brassSoft : C.roseSoft} /></Td>
                  </tr>
                );
              })}
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
      ["effectifs", "Statistiques"], ["suivi", "Suivi par classe"], ["redevables", "Liste des redevables"], ["registre", "Registre"], ["rappel", "Rappel"], ["paiement", "Paiement"],
      ["stats", "Stats paiement"],
      ["personnel", "Personnel / Paie"], ["depenses", "Dépenses"], ["rapport", "Rapport global"], ["rapportMensuel", "Rapport mensuel"], ["parametres", "Paramètres"],
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
                          <Td style={{ fontWeight: 600 }}>{s.prenoms} {s.nom}{(s.montantPersonnalise !== undefined && s.montantPersonnalise !== null && s.montantPersonnalise !== "") && <div><Pill_ text="Boursier" color={C.rose} bg={C.roseSoft} /></div>}</Td>
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

        {compTab === "registre" && (() => {
          const liste = [...students].sort((a, b) => a.nom.localeCompare(b.nom));
          return (
            <Card>
              <div className="no-print" style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 11.5, color: C.textSoft, maxWidth: 480 }}>Vue globale de tous les élèves, toutes classes confondues — à exporter régulièrement comme copie de sécurité. En cas de besoin, ré-importez ce fichier pour restaurer les montants payés.</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn kind="ghost" onClick={() => exportCSV(
                    "registre-paiements.csv",
                    ["Prénoms et Nom", "Matricule", "Classe", "Parent", "Montant total payé", "Montant total restant"],
                    liste.map(s => [`${s.prenoms} ${s.nom}`, s.matricule, classes.find(c => c.id === s.classeId)?.nom, s.parent, studentPaid(s.id), studentReste(s) > 0 ? studentReste(s) : 0])
                  )}><Download size={13} /> Exporter</Btn>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#fff", fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer" }}>
                    <Download size={13} style={{ transform: "rotate(180deg)" }} /> Importer CSV
                    <input type="file" accept=".csv" style={{ display: "none" }} onChange={e => e.target.files[0] && importRegistreCSV(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th>Prénoms et Nom</Th><Th>Matricule</Th><Th>Classe</Th><Th>Parent</Th><Th>Montant payé</Th><Th>Montant restant</Th></tr></thead>
                <tbody>
                  {liste.map(s => {
                    const reste = studentReste(s);
                    return (
                      <tr key={s.id}>
                        <Td style={{ fontWeight: 600 }}>{s.prenoms} {s.nom}</Td>
                        <Td className="f-mono">{s.matricule}</Td>
                        <Td>{classes.find(c => c.id === s.classeId)?.nom}</Td>
                        <Td>{s.parent}</Td>
                        <Td className="f-mono">{fmt(studentPaid(s.id))}</Td>
                        <Td className="f-mono" style={{ color: reste > 0 ? C.rose : C.sage, fontWeight: 700 }}>{fmt(reste > 0 ? reste : 0)}</Td>
                      </tr>
                    );
                  })}
                  {!liste.length && <tr><Td style={{ textAlign: "center", color: C.textSoft }} colSpan={6}>Aucun élève enregistré.</Td></tr>}
                </tbody>
              </table>
            </Card>
          );
        })()}

        {compTab === "rappel" && (() => {
          const liste = students.filter(s => s.classeId === rappelClasse && studentReste(s) > 0);
          const pages = [];
          for (let i = 0; i < liste.length; i += 10) pages.push(liste.slice(i, i + 10));

          const Lettre = (s) => (
            <div style={{ border: `1.5px solid ${C.ink}`, borderRadius: 5, padding: "10px 12px", fontSize: 9.5, lineHeight: 1.5, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 130 }}>
              <div>
                <div style={{ textAlign: "center", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, borderBottom: `1px solid ${C.line}`, paddingBottom: 4 }}>Lettre de rappel</div>
                <div>
                  La direction de <b>{config.etablissement}</b> rappelle que les frais de scolarité de <b>{s.prenoms} {s.nom}</b>, Matricule : <b className="f-mono">{s.matricule}</b>, ne sont pas encore intégralement réglés.
                </div>
                <div style={{ marginTop: 5 }}>Montant restant dû : <b style={{ color: C.rose }}>{fmt(studentReste(s))}</b></div>
              </div>
              <div style={{ fontSize: 8.5, fontStyle: "italic", color: C.textSoft, marginTop: 6 }}>Merci de bien vouloir régulariser cette situation dans les meilleurs délais.</div>
            </div>
          );

          return (
            <div>
              <div className="no-print" style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <Select value={rappelClasse} onChange={e => setRappelClasse(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</Select>
                <Btn kind="ghost" onClick={() => window.print()}><Printer size={13} /> Imprimer les lettres</Btn>
              </div>
              {!liste.length && <Card><div style={{ fontSize: 12, color: C.textSoft }}>Aucun paiement en cours dans cette classe — rien à rappeler.</div></Card>}
              {pages.map((groupe, pIdx) => (
                <div key={pIdx} className="print-area" style={{ pageBreakAfter: pIdx < pages.length - 1 ? "always" : "auto", marginBottom: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {groupe.map(s => <div key={s.id}>{Lettre(s)}</div>)}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

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
              <Select value={paieForm.trancheId} onChange={e => setPaieForm({ ...paieForm, trancheId: e.target.value })} disabled={!paieClasseFiltre}><option value="">Tranche…</option>{tranchesEcole.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}</Select>
              <Input type="number" placeholder="Montant versé" value={paieForm.montant} onChange={e => setPaieForm({ ...paieForm, montant: e.target.value })} />
              <Select value={paieForm.mode} onChange={e => setPaieForm({ ...paieForm, mode: e.target.value })}><option>Espèces</option><option>Orange Money</option><option>Mobile Money (autre)</option><option>Virement</option><option>Chèque</option></Select>
            </div>
            <Btn className="no-print" onClick={enregistrerPaiement}><Check size={13} /> Enregistrer le paiement</Btn>

            {paieForm.studentId && (() => {
              const historiqueEleve = paiements.filter(p => p.studentId === paieForm.studentId).sort((a, b) => b.date.localeCompare(a.date));
              return (
                <div className="no-print" style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>Paiements déjà enregistrés pour cet élève</div>
                  {historiqueEleve.length ? historiqueEleve.map(p => { const trancheNom = tranchesEcole.find(t => t.id === p.trancheId)?.nom;
                    return (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: `1px solid ${C.line}`, fontSize: 12.5 }}>
                      <div>{p.date} — {trancheNom} — <span className="f-mono">{fmt(p.montant)}</span> ({p.mode})</div>
                      <Btn kind="ghost" onClick={() => setRecuId(p.id)}><Printer size={12} /> Imprimer le reçu</Btn>
                    </div>
                    );
                  }) : <div style={{ fontSize: 12, color: C.textSoft }}>Aucun paiement enregistré pour le moment.</div>}
                </div>
              );
            })()}

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
                <div className="print-area" style={{ marginTop: 16, border: `2px solid ${C.ink}`, borderRadius: 4, padding: 22, background: "#fff", boxSizing: "border-box" }}>
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
                    <Row label="Libellé paiement" value={tranchesEcole.find(t => t.id === recu.trancheId)?.nom} />
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
              <tbody>{classes.map(c => { const eleves = students.filter(s => s.classeId === c.id && !s.excluStats); const attendu = eleves.reduce((s, st) => s + studentAttendu(st), 0);
                const percu = eleves.reduce((s, st) => s + studentPaid(st.id), 0);
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
                          ? <button onClick={() => annulerPaieMois(s.id, label)} title="Cliquer pour annuler cette paie" style={{ background: "none", border: "none", cursor: "pointer" }}><Check size={15} color={C.sage} style={{ verticalAlign: "middle" }} /></button>
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
              <Btn onClick={addDepense}>{depForm.id ? <Check size={13} /> : <Plus size={13} />}</Btn>
              {depForm.id && <Btn kind="ghost" onClick={() => setDepForm({ categorie: "", montant: "", description: "" })}><X size={13} /></Btn>}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Date</Th><Th>Catégorie</Th><Th>Description</Th><Th>Montant</Th><Th>Actions</Th></tr></thead>
              <tbody>{[...depenses].sort((a, b) => b.date.localeCompare(a.date)).map(d => (
                <tr key={d.id}>
                  <Td>{d.date}</Td><Td style={{ fontWeight: 600 }}>{d.categorie}</Td><Td>{d.description}</Td><Td className="f-mono">{fmt(d.montant)}</Td>
                  <Td><div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setDepForm(d)} style={{ background: "none", border: "none", cursor: "pointer" }}><Pencil size={14} color={C.textSoft} /></button>
                    <button onClick={() => deleteDepense(d.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color={C.rose} /></button>
                  </div></Td>
                </tr>
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
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontSize: 11.5, color: C.textSoft }}>
              Le mot de passe comptabilité n'est plus modifiable depuis cet écran. Pour le changer, ouvrez votre projet Supabase → Table Editor → table <b>app_state</b> → ligne <b>main</b> → modifiez le champ <b>comptaPassword</b> dans la colonne "data".
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
              <div className="f-mono" style={{ fontSize: 16 }}>{(() => { const attenduTotal = students.filter(st => !st.excluStats).reduce((s, st) => s + studentAttendu(st), 0); return attenduTotal ? Math.round(totalEntrees / attenduTotal * 100) : 0; })()}%</div>
              <div style={{ fontSize: 12, color: C.textSoft, marginTop: 4 }}>Élèves redevables (paiement en cours) : <b style={{ color: C.rose }}>{students.filter(s => studentReste(s) > 0).length}</b></div>
            </Card>
          </div>
        )}

        {compTab === "rapportMensuel" && (() => {
          const moisLabel = `${MOIS[rapportMoisIndex]} ${rapportMoisAnnee}`;
          const depensesMois = depenses.filter(d => { const dt = new Date(d.date); return dt.getMonth() === rapportMoisIndex && dt.getFullYear() === rapportMoisAnnee; });
          const paieMois = paieHist.filter(p => p.mois === moisLabel && staff.some(st => st.id === p.staffId));
          const totalDepMois = depensesMois.reduce((s, d) => s + Number(d.montant), 0);
          const totalPaieMois = paieMois.reduce((s, p) => s + Number(p.montant), 0);
          return (
            <div>
              <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                <Select value={rapportMoisIndex} onChange={e => setRapportMoisIndex(Number(e.target.value))}>
                  {MOIS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </Select>
                <Input type="number" value={rapportMoisAnnee} onChange={e => setRapportMoisAnnee(Number(e.target.value) || rapportMoisAnnee)} style={{ width: 90 }} />
                <Btn kind="ghost" onClick={() => window.print()}><Printer size={13} /> Imprimer</Btn>
              </div>

              <Card className="print-area">
                <div className="f-display" style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{config.etablissement} — Rapport de {moisLabel}</div>

                <div style={{ fontWeight: 700, marginBottom: 6 }}>Dépenses du mois</div>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
                  <thead><tr><Th>Date</Th><Th>Catégorie</Th><Th>Description</Th><Th>Montant</Th></tr></thead>
                  <tbody>
                    {depensesMois.map(d => <tr key={d.id}><Td>{d.date}</Td><Td style={{ fontWeight: 600 }}>{d.categorie}</Td><Td>{d.description}</Td><Td className="f-mono">{fmt(d.montant)}</Td></tr>)}
                    {!depensesMois.length && <tr><Td style={{ textAlign: "center", color: C.textSoft }} colSpan={4}>Aucune dépense ce mois-ci.</Td></tr>}
                    <tr style={{ background: C.paper, fontWeight: 700 }}><Td colSpan={3}>Total dépenses</Td><Td className="f-mono">{fmt(totalDepMois)}</Td></tr>
                  </tbody>
                </table>

                <div style={{ fontWeight: 700, marginBottom: 6, marginTop: 14 }}>Salaires versés du mois</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><Th>Employé</Th><Th>Poste</Th><Th>Montant</Th></tr></thead>
                  <tbody>
                    {paieMois.map(p => { const s = staff.find(x => x.id === p.staffId); return <tr key={p.id}><Td style={{ fontWeight: 600 }}>{s?.nom || "—"}</Td><Td>{s?.poste || "—"}</Td><Td className="f-mono">{fmt(p.montant)}</Td></tr>; })}
                    {!paieMois.length && <tr><Td style={{ textAlign: "center", color: C.textSoft }} colSpan={3}>Aucun salaire versé ce mois-ci.</Td></tr>}
                    <tr style={{ background: C.paper, fontWeight: 700 }}><Td colSpan={2}>Total salaires versés</Td><Td className="f-mono">{fmt(totalPaieMois)}</Td></tr>
                  </tbody>
                </table>

                <div style={{ marginTop: 16, paddingTop: 10, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>Total sorties du mois (dépenses + salaires)</span>
                  <span className="f-mono">{fmt(totalDepMois + totalPaieMois)}</span>
                </div>
              </Card>
            </div>
          );
        })()}
      </div>
    );
  };

  const pages = { accueil: renderAccueil, eleves: renderEleves, classes: renderClasses, materiels: renderMateriels, saisie: renderSaisie, statSaisies: renderStatSaisies, bulletin: renderBulletin, resultats: renderResultats, comptabilite: renderComptabilite };

  return (
    <div className="f-body" style={{ minHeight: "100vh", background: C.paper, display: "flex" }}>
      {FONTS}
      {saveStatus !== "saved" && (
        <div className="no-print" style={{ position: "fixed", bottom: 14, right: 14, zIndex: 999, display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, boxShadow: "0 2px 10px rgba(0,0,0,0.15)", background: saveStatus === "error" ? C.rose : C.brass, color: "#fff" }}>
          {saveStatus === "error" ? "⚠️ Non enregistré — nouvelle tentative en cours…" : "Enregistrement en cours…"}
        </div>
      )}
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
