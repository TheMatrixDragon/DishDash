import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera, Image as ImageIcon, Loader2, Salad, Search, Sparkles, Upload,
  Filter, Clock, ShieldAlert, Leaf, DollarSign, Calendar, List as ListIcon,
  Users, Wallet, Link2, Home as HomeIcon, Wand2, MessageCircle, Share2,
  ArrowLeftRight, PlusCircle
} from "lucide-react";

/* ---- Minimal UI shims (replace shadcn/ui) ---- */
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl shadow ${className}`}>{children}</div>
);
const CardContent = ({ className = "", children }) => (
  <div className={className}>{children}</div>
);
const Button = ({ className = "", children, onClick, disabled, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md transition disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);
const Textarea = ({ className = "", ...props }) => (
  <textarea className={`w-full px-3 py-2 rounded-md ${className}`} {...props} />
);

/* ======== helpers ======== */
const fmtMoney = (n) => (typeof n === "number" ? `$${n.toFixed(2)}` : "—");
const addDaysISO = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
const daysUntil = (iso) => { const now = new Date(); const end = new Date(iso + "T00:00:00"); return Math.ceil((end - now) / 86400000); };

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

const Toast = ({ text }) => (
  <div className="fixed top-3 right-3 z-[9999] px-3 py-2 rounded bg-black/80 text-white text-xs shadow">{text}</div>
);

function SafeImg({ src, alt, className, fallbackSrc }) {
  const [url, setUrl] = useState(src);
  return <img src={url} alt={alt} loading="lazy" className={className} onError={() => setUrl(fallbackSrc || STOCKS.vision.src)} />;
}

/* ======== themes ======== */
const THEMES = {
  dark: { name: "Dark Linen", background: "bg-[#141615] text-[#ecebe7]", overlay: "bg-[#161816]/80 backdrop-blur-sm min-h-screen",
    card: "bg-[#1a1c1a] border border-[#2d332a] text-[#ecebe7]", btn: "bg-gradient-to-br from-[#5a6e49] via-[#4e6040] to-[#3a4a2b] text-[#f0f0f0] hover:from-[#6b7f56] hover:to-[#44533a]",
    pill: "rounded-full border border-[#4a5645]/60 px-3 py-1 text-xs bg-[#1b2219]/70 text-[#d4c7a1]", subtext: "text-[#a7ada8]",
    header: "bg-[#171a17]/90 backdrop-blur border-b border-[#2d332a]", input: "bg-[#1b1e1b]/70 border border-[#2d332a]",
    link: "bg-[#1b1e1b]/70 border border-[#2d332a] hover:bg-[#2a3425] text-[#eae6de]" },
  warm: { name: "Warm Stone", background: "bg-[#f7f1e7] text-[#1f1f1f]", overlay: "bg-white/80 backdrop-blur min-h-screen",
    card: "bg-[#fffaf2] border border-[#e8dfd2]", btn: "bg-gradient-to-br from-[#8b9f72] via-[#768a5e] to-[#5a6e49] text-white hover:from-[#98ac7f] hover:to-[#677a52]",
    pill: "rounded-full border border-[#d9cbb8] px-3 py-1 text-xs bg-[#fdf7ee] text-[#6f5a3a]", subtext: "text-[#6b6b6b]",
    header: "bg-[#f9f4ec]/90 backdrop-blur border-b border-[#e8dfd2]", input: "bg-white border border-[#e8dfd2]",
    link: "bg-white border border-[#e8dfd2] hover:bg-[#f3ecdf] text-[#4a3e2b]" },
  olive: { name: "Olive Paper", background: "bg-[#ecf3e8] text-[#1d261a]", overlay: "bg-[#f3f7f0]/70 backdrop-blur min-h-screen",
    card: "bg-[#f6fbf2] border border-[#cfd8c8]", btn: "bg-gradient-to-br from-[#6f844c] via-[#5f7342] to-[#4b5d34] text-white hover:from-[#7f9658] hover:to-[#586a3d]",
    pill: "rounded-full border border-[#c7d4bd] px-3 py-1 text-xs bg-[#eaf2e1] text-[#3f5a2a]", subtext: "text-[#516246]",
    header: "bg-[#f6f9f3]/90 backdrop-blur border-b border-[#cfd8c8]", input: "bg-white border border-[#cfd8c8]",
    link: "bg-white border border-[#cfd8c8] hover:bg-[#e7eddc] text-[#3f4d30]" }
};
const STOCKS = {
  homeTop: { src: "https://images.unsplash.com/photo-1513135065346-a0989f33f06b?q=80&w=1200&auto=format&fit=crop", alt: "Friends cooking together" },
  vision: { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2200&auto=format&fit=crop", alt: "Fresh market produce" },
  scanner: { src: "https://images.unsplash.com/photo-1604908812011-003a219f1f5e?q=80&w=2200&auto=format&fit=crop", alt: "Scanning a grocery barcode" },
  planner: { src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2200&auto=format&fit=crop", alt: "Healthy bowl on table" },
  community: { src: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=2200&auto=format&fit=crop", alt: "Friends cooking and sharing food" },
  pantry: { src: "https://images.unsplash.com/photo-1586201375754-1421e0aa2f66?q=80&w=2200&auto=format&fit=crop", alt: "Pantry shelves with jars of food" },
  loyalty: { src: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?q=80&w=2200&auto=format&fit=crop", alt: "Shopping cart in a grocery store" },
  clipper: { src: "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?q=80&w=2200&auto=format&fit=crop", alt: "Recipe clipping on tablet" }
};

/* ======== types-ish data ======== */
const BANK = [
  { id: "1", title: "Rustic Lentil & Spinach Stew", totalTime: "30 min", diets: ["Vegan", "Gluten-free"], allergens: [], inflammatoryFlags: ["No refined sugar"], antiNutrients: ["Soak lentils"], anemiaFriendly: ["Iron-rich"], ingredients: [{ name: "Green lentils", qty: "1 cup" }, { name: "Spinach", qty: "3 cups" }, { name: "Onion" }, { name: "Garlic" }, { name: "Olive oil", qty: "1 tbsp" }, { name: "Vegetable broth", qty: "3 cups" }, { name: "Lemon", qty: "1/2" }], instructions: ["Sauté onion & garlic", "Simmer lentils", "Wilt spinach, lemon"], image: STOCKS.planner.src, costPerServing: 1.8 },
  { id: "2", title: "Herbed Chicken & Quinoa Bowl", totalTime: "25 min", diets: ["High-protein", "Dairy-free"], allergens: ["Dairy"], inflammatoryFlags: ["Avoid seed oils"], antiNutrients: ["Rinse quinoa"], anemiaFriendly: ["Add bell pepper"], ingredients: [{ name: "Chicken breast", qty: "10 oz" }, { name: "Quinoa", qty: "1 cup" }, { name: "Bell pepper" }, { name: "Parsley" }, { name: "Olive oil", qty: "1 tbsp" }], instructions: ["Cook quinoa", "Sear chicken", "Combine"], image: STOCKS.vision.src, costPerServing: 3.2 }
];
const BARCODE_DB = {
  "036000291452": { name: "Canned Chickpeas (15oz)", expiresDays: 365, ingredients: ["Chickpeas", "Water", "Salt"] },
  "012345678905": { name: "Greek Yogurt 2% (5oz)", expiresDays: 10, ingredients: ["Milk", "Cultures"] }
};
const DIETS = ["Vegan","Vegetarian","Keto","Paleo","Mediterranean","Gluten-free","Dairy-free","High-protein"];
const ALLERGENS = ["Dairy","Gluten","Eggs","Soy","Peanuts","Tree nuts","Fish","Shellfish","Sesame"];
const NUTRITION = ["Low sugar","Low sodium","High fiber","Anti-inflammatory"];

/* ======== logic ======== */
const textSuggest = (ingredients, notes) => {
  const t = `${ingredients} ${notes}`.toLowerCase();
  const picks = [];
  if (/(spinach|lentil|vegan)/.test(t)) picks.push(BANK[0]);
  if (/(chicken|quinoa|protein)/.test(t)) picks.push(BANK[1]);
  return picks.length ? picks : BANK;
};
const photoSuggest = () => ({ detected: [{ name: "Spinach" }, { name: "Lentils" }, { name: "Lemon" }], recipes: BANK });
const mealPlanFrom = (source, days = 3) => {
  const items = [];
  for (let d = 0; d < days; d++) {
    const rA = source[(d * 2) % source.length]?.id;
    const rB = source[(d * 2 + 1) % source.length]?.id;
    items.push({ date: addDaysISO(d), recipeIds: [rA, rB].filter(Boolean) });
  }
  return { days: items };
};

/* ======== small UI ======== */
function SectionTitle({ icon: Icon, title, subtitle, subtextClass }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-[#b8a17f]" />
      <div>
        <h3 className="font-serif text-base">{title}</h3>
        {subtitle && <p className={`text-xs -mt-0.5 ${subtextClass}`}>{subtitle}</p>}
      </div>
    </div>
  );
}
function Hero({ img, title, variant = "default" }) {
  const h = variant === "banner" ? "h-56 md:h-80" : "h-40 md:h-60";
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <SafeImg src={img} alt={title} className={`w-full ${h} object-cover`} />
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute bottom-2 left-3 right-3 text-white font-serif text-base md:text-lg font-semibold drop-shadow">{title}</div>
    </div>
  );
}
function BottomNav({ page, onGo, T }) {
  const Item = ({ k, label, Icon }) => (
    <button onClick={() => onGo(k)} className={`relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl ${page === k ? "bg-white/10" : "opacity-80 hover:opacity-100"}`} aria-current={page === k ? "page" : undefined}>
      <Icon className="h-5 w-5" />
      <span className="text-[10px] mt-0.5">{label}</span>
      {page === k && <span className="absolute -top-1.5 h-1.5 w-1.5 rounded-full bg-[#b8a17f]" />}
    </button>
  );
  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${T.header} border-t ${T.subtext} backdrop-blur z-40`}>
      <div className="mx-auto max-w-6xl px-3">
        <div className="grid grid-cols-8 gap-1 text-xs text-center">
          <Item k="home" label="Home" Icon={HomeIcon} />
          <Item k="create" label="SnapCook" Icon={Wand2} />
          <Item k="scanner" label="Scanner" Icon={Camera} />
          <Item k="planner" label="Planner" Icon={Calendar} />
          <Item k="community" label="Community" Icon={Users} />
          <Item k="pantry" label="Pantry" Icon={ListIcon} />
          <Item k="loyalty" label="Retail" Icon={Wallet} />
          <Item k="clipper" label="Clipper" Icon={Link2} />
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
function HomeTile({ title, desc, img, onClick, className }) {
  return (
    <button onClick={onClick} className={`relative overflow-hidden rounded-2xl group focus:outline-none ${className || ""}`} aria-label={title}>
      <SafeImg src={img} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-neutral-800/0 group-hover:bg-neutral-800/45 transition-colors" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="text-white font-serif text-base md:text-lg tracking-wide font-semibold drop-shadow">{title}</div>
        <div className="hidden md:block text-white/90 text-[11px] leading-snug opacity-0 group-hover:opacity-100 transition-opacity">{desc}</div>
      </div>
    </button>
  );
}

/* ======== main app ======== */
export default function App() {
  const prefersReduced = useReducedMotion();
  const [themeKey, setThemeKey] = useLocalStorage("dd_theme", "warm");
  const T = THEMES[themeKey];
  const [page, setPage] = useLocalStorage("dd_page", "home");
  const go = (p) => setPage(p);
  const [toast, setToast] = useState(null);
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 1400); };

  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState("spinach, lentils, onion, garlic, lemon");
  const [notes, setNotes] = useState("vegan, quick dinner");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [detected, setDetected] = useState(null);
  const [budget, setBudget] = useState(10);
  const [selDiets, setSelDiets] = useState(new Set());
  const [selAllergies, setSelAllergies] = useState(new Set());
  const [selNutrition, setSelNutrition] = useState(new Set());
  const toggleSet = (setter, key) => setter(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const matchesFilters = (r) => {
    if (selDiets.size && !r.diets.some(d => selDiets.has(d))) return false;
    if (selAllergies.size && r.allergens.some(a => selAllergies.has(a))) return false;
    return true;
  };

  const onUpload = (file) => { if (!file) return; const reader = new FileReader(); reader.onload = (e) => setImage(String(e.target?.result)); reader.readAsDataURL(file); };
  const genText = async () => { setLoading(true); await new Promise((r)=>setTimeout(r,300)); setDetected(null); const base = textSuggest(ingredients, notes); setRecipes(base); setLoading(false); };
  const genPhoto = async () => { if (!image) return; setLoading(true); await new Promise((r)=>setTimeout(r,300)); const res = photoSuggest(); setDetected(res.detected); setRecipes(res.recipes); setLoading(false); };

  const [plan, setPlan] = useState(null);
  const buildPlan = () => { const base = recipes && recipes.length ? recipes : BANK; setPlan(mealPlanFrom(base, 3)); };

  const [pantry, setPantry] = useLocalStorage("dd_pantry", []);
  const addDetectedToPantry = () => { if (!detected) return; const add = detected.map((d) => ({ name: d.name, expiresOn: addDaysISO(5) })); setPantry((p) => [...p, ...add]); showToast("Added to pantry"); };

  const [barcode, setBarcode] = useState("");
  const [barcodeResult, setBarcodeResult] = useState(null);
  const doBarcode = () => {
    const hit = BARCODE_DB[barcode.trim()] || { name: "Generic Pantry Item", expiresDays: 21, ingredients: ["—"] };
    const expiresOn = addDaysISO(hit.expiresDays || 21);
    setBarcodeResult({ name: hit.name, expiresOn, ingredients: hit.ingredients || ["—"] });
    setPantry((prev) => [...prev, { name: hit.name, expiresOn }]);
  };

  const [following, setFollowing] = useLocalStorage("dd_follow", []);
  const [messagesByProfile, setMsgs] = useLocalStorage("dd_msgs", {});
  const [activeChat, setActiveChat] = useState("p1");
  const [groups, setGroups] = useLocalStorage("dd_groups", []);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [shared, setShared] = useLocalStorage("dd_shared", []);
  const meId = "me";

  const PROFILES = [
    { id: "p1", name: "Chef Lila", bio: "Plant-forward, 20-min dinners", avatar: "🥗", specialties: ["Vegan", "Mediterranean"], liveUrl: "https://www.youtube.com/live/abcd1234", dmRule: "Everyone" },
    { id: "p2", name: "Coach Max", bio: "High-protein bulk cooks", avatar: "🏋️", specialties: ["High-protein", "Gluten-free"], dmRule: "Followers only" },
    { id: "p3", name: "Dr. Chen", bio: "Low-FODMAP & histamine-aware", avatar: "🩺", specialties: ["Low-FODMAP", "Low-histamine"], dmRule: "No one" }
  ];
  const isFollowing = (id) => following.includes(id);
  const toggleFollow = (id) => setFollowing((prev) => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const sendMsg = (id, text) => {
    if (!text.trim()) return; const target = PROFILES.find(x=>x.id===id);
    if (target?.dmRule === "No one") { showToast("This creator does not accept DMs."); return; }
    if (target?.dmRule === "Followers only" && !isFollowing(id)) { showToast("Follow to message this creator."); return; }
    setMsgs((prev) => { const copy = { ...prev }; const list = copy[id] ? [...copy[id]] : []; list.push({ from: "me", text, ts: Date.now() }); copy[id] = list; return copy; });
  };
  const createGroup = () => { if (!newGroupName.trim()) return; setGroups([...groups, { id: String(Date.now()), name: newGroupName, members: [meId], description: newGroupDesc }]); setNewGroupName(""); setNewGroupDesc(""); showToast("Group created"); };
  const shareRecipe = (r) => { const credited = { ...r, authorId: meId }; setShared((prev)=>[...prev, credited]); showToast("Shared to community"); };

  useEffect(() => {
    const onHash = () => { const raw = (location.hash||"#home").slice(1); const ok = ["home","create","scanner","planner","community","pantry","loyalty","clipper"]; setPage(ok.includes(raw) ? raw : "home"); };
    onHash(); window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { const desired = `#${page}`; if (location.hash !== desired) location.hash = desired; }, [page]);

  const Section = ({ children }) => (<section className="mx-auto max-w-6xl px-5 pt-6 pb-24">{children}</section>);

  const HomePage = (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[140px] md:auto-rows-[180px]">
        <div className="col-span-2 md:col-span-3 row-span-1">
          <HomeTile title="SnapCook" desc="Turn photos or pantry text into recipes" img={STOCKS.homeTop.src} onClick={()=>go("create")} className="h-full" />
        </div>
        <HomeTile title="Scanner" desc="Barcode → expiry & info" img={STOCKS.scanner.src} onClick={()=>go("scanner")} />
        <HomeTile title="Planner" desc="Plan 3 days in seconds" img={STOCKS.planner.src} onClick={()=>go("planner")} />
        <HomeTile title="Community" desc="Follow creators, join cook-alongs" img={STOCKS.community.src} onClick={()=>go("community")} />
        <HomeTile title="Pantry" desc="Track what you have" img={STOCKS.pantry.src} onClick={()=>go("pantry")} />
        <HomeTile title="Retail" desc="Link loyalty for deals" img={STOCKS.loyalty.src} onClick={()=>go("loyalty")} />
        <HomeTile title="Clipper" desc="Save recipes from web" img={STOCKS.clipper.src} onClick={()=>go("clipper")} />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="text-xs">Theme</div>
        <div className="flex items-center gap-2 text-xs">
          {["warm","olive","dark"].map((k) => (
            <button key={k} onClick={()=>setThemeKey(k)} className={`px-2 py-1 rounded ${T.input} ${themeKey===k?"ring-2 ring-emerald-500":""}`}>{THEMES[k].name}</button>
          ))}
        </div>
      </div>
    </Section>
  );

  function RecipeCard({ r, onShare }) {
    return (
      <Card className={`${T.card} rounded-2xl`}>
        {r.image && (
          <div className="overflow-hidden rounded-t-2xl">
            <img src={r.image} alt={r.title} className="h-44 w-full object-cover" loading="lazy" />
          </div>
        )}
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-serif font-semibold leading-tight">{r.title}</h4>
              <div className={`mt-1 flex flex-wrap items-center gap-2 text-xs ${T.subtext}`}>
                <Clock className="h-3.5 w-3.5" />
                <span>{r.totalTime}</span>
                <DollarSign className="h-3.5 w-3.5 ml-3" />
                <span>~{fmtMoney(r.costPerServing)}/serving</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {r.diets.map((d) => (<span key={d} className={T.pill}>{d}</span>))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <SectionTitle icon={Sparkles} title="Ingredients" subtextClass={T.subtext} />
              <ul className="text-sm list-disc list-inside">
                {r.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span>{(ing.qty ? `${ing.qty} ` : "") + ing.name}</span>
                    {(r.substitutions?.[ing.name] || []).length > 0 && (
                      <span title={`Swaps: ${(r.substitutions?.[ing.name] || []).join(", ")}`} className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded ${T.input} text-[10px]`}>
                        <ArrowLeftRight className="h-3 w-3" /> Swap
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <SectionTitle icon={Sparkles} title="Instructions" subtextClass={T.subtext} />
              <ol className="text-sm list-decimal list-inside">
                {r.instructions.map((s, i) => (<li key={i}>{s}</li>))}
              </ol>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            {onShare && <Button className={T.link} onClick={()=>onShare(r)}><Share2 className="mr-2 h-4 w-4"/>Share</Button>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const CreatePage = (
    <Section>
      <Hero img={STOCKS.vision.src} title="SnapCook" variant="banner" />
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <Card className={`${T.card} rounded-2xl`}>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <Button className={`${T.btn} justify-start`} onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload Photo</Button>
              <Button className={`${T.btn} justify-start`} disabled><Camera className="mr-2 h-4 w-4" /> Use Camera</Button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>onUpload(e.target.files?.[0])} />
            {image ? (
              <div className="overflow-hidden rounded-xl border border-black/10">
                <img src={image} alt="upload preview" className="w-full object-cover" />
              </div>
            ) : (
              <div className="grid place-items-center rounded-xl border border-black/10 p-6 text-sm opacity-70">
                <ImageIcon className="h-8 w-8 mb-1" /> No image yet
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className={`text-xs ${T.subtext}`}>Ingredients / Pantry</label>
                <Textarea value={ingredients} onChange={(e)=>setIngredients(e.target.value)} placeholder="e.g. chicken, quinoa, bell pepper, lemon" className={`mt-1 ${T.input} min-h-[104px]`} />
              </div>
              <div>
                <label className={`text-xs ${T.subtext}`}>Notes / Goals</label>
                <Textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="e.g. vegan, anti-inflammatory, 20 minutes" className={`mt-1 ${T.input} min-h-[104px]`} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button className={T.btn} onClick={genText} disabled={loading}>{loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Thinking...</>) : (<><Search className="mr-2 h-4 w-4"/>Generate</>)}</Button>
              <Button className={T.link} onClick={genPhoto} disabled={!image || loading}><Wand2 className="mr-2 h-4 w-4"/> From Photo</Button>
              {detected && (<Button className={T.link} onClick={addDetectedToPantry}><ListIcon className="mr-2 h-4 w-4"/> Add to Pantry</Button>)}
            </div>
          </CardContent>
        </Card>
        {/* Filters */}
        <Card className={`${T.card} rounded-2xl`}>
          <CardContent className="p-6 space-y-5">
            <SectionTitle icon={Filter} title="Filters" subtitle="Refine results" subtextClass={T.subtext} />
            <div className="flex items-center gap-3 text-xs">
              <span>Budget per serving</span>
              <div className="flex gap-2">
                {[5,10,15,20].map((n)=> (
                  <button key={n} onClick={()=>setBudget(n)} className={`px-2 py-1 rounded ${T.input} ${budget===n?"ring-2 ring-emerald-500":""}`}>${n}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <SectionTitle icon={Sparkles} title="Diets" subtitle="Pick any" subtextClass={T.subtext} />
                <button className={`text-xs px-2 py-1 rounded ${T.input}`} onClick={()=>setSelDiets(new Set())}>Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {DIETS.map((d)=> (
                  <button key={d} onClick={()=>toggleSet(setSelDiets, d)} className={`text-xs px-3 py-1.5 rounded-full ${T.input} ${selDiets.has(d)?'ring-2 ring-emerald-500':''}`}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <SectionTitle icon={ShieldAlert} title="Allergens" subtitle="Hide recipes containing" subtextClass={T.subtext} />
                <button className={`text-xs px-2 py-1 rounded ${T.input}`} onClick={()=>setSelAllergies(new Set())}>Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((a)=> (
                  <button key={a} onClick={()=>toggleSet(setSelAllergies, a)} className={`text-xs px-3 py-1.5 rounded-full ${T.input} ${selAllergies.has(a)?'ring-2 ring-rose-500':''}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <SectionTitle icon={Leaf} title="Nutrition" subtitle="Intent" subtextClass={T.subtext} />
                <button className={`text-xs px-2 py-1 rounded ${T.input}`} onClick={()=>setSelNutrition(new Set())}>Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {NUTRITION.map((n)=> (
                  <button key={n} onClick={()=>toggleSet(setSelNutrition, n)} className={`text-xs px-3 py-1.5 rounded-full ${T.input} ${selNutrition.has(n)?'ring-2 ring-amber-500':''}`}>{n}</button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        {recipes && (()=>{ const list = recipes.filter((r)=>matchesFilters(r)); return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle icon={Sparkles} title="Suggested Recipes" subtitle="AI-generated from your inputs" subtextClass={T.subtext} />
              <div className={`text-xs ${T.subtext}`}>{list.length} results</div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {list.map((r) => (
                <motion.div key={r.id} initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                  <RecipeCard r={r} onShare={shareRecipe} />
                </motion.div>
              ))}
            </div>
          </div>
        ); })()}
      </div>
    </Section>
  );

  const PlannerPage = (
    <Section>
      <Hero img={STOCKS.planner.src} title="Planner" />
      <div className="mt-4 flex gap-3">
        <Button className={T.btn} onClick={buildPlan}><Calendar className="mr-2 h-4 w-4"/>Build 3-day plan</Button>
        <Button className={T.link} onClick={()=>setPage('create')}><Wand2 className="mr-2 h-4 w-4"/>Generate more recipes</Button>
      </div>
      {plan && (
        <div className="mt-4 space-y-4">
          {plan.days.map((d,i)=>(
            <Card key={i} className={`${T.card} rounded-2xl`}>
              <CardContent className="p-4">
                <div className="font-serif">{d.date}</div>
                <ul className="text-sm list-disc list-inside mt-2">
                  {d.recipeIds.map((rid)=>{ const r = (recipes||BANK).find(x=>x.id===rid); return <li key={rid}>{r? r.title : rid}</li>; })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );

  const ScannerPage = (
    <Section>
      <Hero img={STOCKS.scanner.src} title="Scanner" />
      <Card className={`${T.card} rounded-2xl mt-4`}>
        <CardContent className="p-6 space-y-4">
          <div className="text-sm">Enter a UPC/EAN to simulate a lookup</div>
          <input value={barcode} onChange={(e)=>setBarcode(e.target.value)} inputMode="numeric" pattern="[0-9]*" placeholder="036000291452" className={`w-full px-3 py-2 rounded-md ${T.input}`} />
          <div className="flex gap-3">
            <Button className={T.btn} onClick={doBarcode}><Search className="mr-2 h-4 w-4"/>Lookup</Button>
          </div>
          {barcodeResult && (
            <div className="text-sm">
              <div className="font-medium">{barcodeResult.name}</div>
              <div className={`text-xs ${T.subtext}`}>Expires on {barcodeResult.expiresOn}</div>
              <div className="mt-2">Ingredients: {barcodeResult.ingredients.join(", ")}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </Section>
  );

  function ChatBox({ id, messagesByProfile, setMsgs, sendMsg, T }) {
    const [text, setText] = useState("");
    const list = messagesByProfile[id] || [];
    const onSend = () => { sendMsg(id, text); setText(""); };
    return (
      <div>
        <ul className="space-y-2 max-h-60 overflow-auto pr-1">
          {list.length === 0 && <li className={`text-xs ${T.subtext}`}>No messages yet</li>}
          {list.map((m,i)=>(
            <li key={i} className={`text-sm ${m.from==='me' ? 'text-right' : ''}`}>
              <span className={`inline-block px-2 py-1 rounded ${T.input}`}>{m.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write a message" className={`flex-1 px-3 py-2 rounded-md ${T.input}`} />
          <Button className={T.btn} onClick={onSend}><MessageCircle className="mr-2 h-4 w-4"/>Send</Button>
        </div>
      </div>
    );
  }

  const CommunityPage = (
    <Section>
      <Hero img={STOCKS.community.src} title="Community" />
      <Card className={`${T.card} rounded-2xl mt-4`}>
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-medium mb-2 flex items-center gap-2"><Users className="h-4 w-4" />Groups</div>
          <div className="flex gap-2">
            <input value={newGroupName} onChange={(e)=>setNewGroupName(e.target.value)} placeholder="Group name" className={`flex-1 px-2 py-1 rounded ${T.input}`} />
            <input value={newGroupDesc} onChange={(e)=>setNewGroupDesc(e.target.value)} placeholder="Description" className={`flex-1 px-2 py-1 rounded ${T.input}`} />
            <Button className={`${T.btn}`} onClick={createGroup}><PlusCircle className="h-4 w-4 mr-1"/>Add</Button>
          </div>
          <ul className="text-sm list-disc list-inside">
            {groups.map((g) => (<li key={g.id}>{g.name} — {g.description || "No description"}</li>))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card className={`${T.card} rounded-2xl`}>
          <CardContent className="p-4 space-y-3">
            {PROFILES.map((p)=>(
              <div key={p.id} className={`p-3 rounded-lg ${T.input} flex items-center justify-between`}>
                <button className="text-left" onClick={()=>setActiveChat(p.id)}>
                  <div className="text-sm font-medium flex items-center gap-2"><span>{p.avatar}</span> <span className="flex items-center gap-1">{p.name}{p.liveUrl && <span className="relative inline-flex items-center ml-1"><span className="absolute inline-flex h-2 w-2 rounded-full bg-red-500 opacity-60 animate-ping"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span></span>}</span></div>
                  <div className={`text-[11px] ${T.subtext}`}>{p.bio}</div>
                  <div className="mt-1 flex gap-2 text-[10px]">{p.specialties.map((s)=>(<span key={s} className={T.pill}>{s}</span>))}</div>
                </button>
                <div className="flex items-center gap-2">
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className={`text-xs px-2 py-1 rounded ${T.link}`}>
                      <Share2 className="inline h-3.5 w-3.5 mr-1" /> Live
                    </a>
                  )}
                  <button onClick={()=>toggleFollow(p.id)} className={`text-xs px-2 py-1 rounded ${T.input}`}>{isFollowing(p.id)?"Following":"Follow"}</button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className={`${T.card} rounded-2xl`}>
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><MessageCircle className="h-4 w-4"/>DMs</div>
            <ChatBox id={activeChat} messagesByProfile={messagesByProfile} setMsgs={setMsgs} sendMsg={sendMsg} T={T} />
          </CardContent>
        </Card>
      </div>

      {shared.length > 0 && (
        <div className="mt-4">
          <SectionTitle icon={Share2} title="Community Recipes" subtitle="Credited contributions" subtextClass={T.subtext} />
          <div className="grid md:grid-cols-2 gap-5 mt-2">
            {shared.map((r,i)=> (
              <Card key={`${r.id}-shared-${i}`} className={`${T.card} rounded-2xl`}>
                <CardContent className="p-4">
                  <div className="text-sm font-medium">{r.title} <span className={`text-xs ml-2 ${T.subtext}`}>by {r.authorId === meId ? 'You' : r.authorId}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Section>
  );

  const PantryPage = (
    <Section>
      <Hero img={STOCKS.pantry.src} title="Pantry" />
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {pantry.length === 0 ? (
          <div className={`text-sm ${T.subtext}`}>No items yet. Add from SnapCook or Scanner.</div>
        ) : pantry.map((p,i)=>(
          <Card key={`${p.name}-${i}`} className={`${T.card} rounded-2xl`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className={`text-xs ${T.subtext}`}>Expires {p.expiresOn} ({Math.max(0, daysUntil(p.expiresOn))} d)</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );

  const LoyaltyPage = (
    <Section>
      <Hero img={STOCKS.loyalty.src} title="Retail & Loyalty" />
      <div className={`mt-3 text-sm ${T.subtext}`}>Placeholder: link loyalty accounts for deals and nutrition pulls.</div>
    </Section>
  );

  const ClipperPage = (
    <Section>
      <Hero img={STOCKS.clipper.src} title="Clipper" />
      <div className={`mt-3 text-sm ${T.subtext}`}>Placeholder: import recipes from URLs and save to your journal.</div>
    </Section>
  );

  return (
    <div className={`${T.background}`}>
      <header className={`${T.header} sticky top-0 z-30`}>
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#3f4d30] grid place-items-center shadow"><Salad className="h-4 w-4 text-[#b8a17f]"/></div>
            <div>
              <h1 className="text-base font-serif font-semibold">Dish Dash</h1>
              <p className={`text-[11px] -mt-0.5 ${T.subtext}`}>SnapCook • Planner • Scanner • Community</p>
            </div>
          </div>
        </div>
      </header>

      <main className={`${THEMES[themeKey].overlay}`}>
        {page === 'home' && HomePage}
        {page === 'create' && CreatePage}
        {page === 'planner' && PlannerPage}
        {page === 'scanner' && ScannerPage}
        {page === 'community' && CommunityPage}
        {page === 'pantry' && PantryPage}
        {page === 'loyalty' && LoyaltyPage}
        {page === 'clipper' && ClipperPage}
        <div className="h-20" />
      </main>

      <BottomNav page={page} onGo={go} T={T} />
      {toast && <Toast text={toast} />}
    </div>
  );
}
