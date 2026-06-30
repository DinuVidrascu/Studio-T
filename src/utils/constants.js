// Palette: mapped to CSS Variables for theming (Light/Dark mode)
export const C = {
  paper:'var(--c-paper)', panel:'var(--c-panel)', panelAlt:'var(--c-panel-alt)',
  ink:'var(--c-ink)', inkSoft:'var(--c-ink-soft)', inkFaint:'var(--c-ink-faint)',
  line:'var(--c-line)', lineSoft:'var(--c-line-soft)',
  primary:'var(--c-primary)', primarySoft:'var(--c-primary-soft)',
  coral:'var(--c-coral)', coralSoft:'var(--c-coral-soft)',
  amber:'var(--c-amber)', amberSoft:'var(--c-amber-soft)',
  sage:'var(--c-sage)', sageSoft:'var(--c-sage-soft)',
  rose:'var(--c-rose)',
  shadow:'var(--c-shadow)',
  shadowSoft:'var(--c-shadow-soft)',
};

export const SERIF = 'Playfair Display, Georgia, "Iowan Old Style", "Times New Roman", serif';
export const SANS  = 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const TL_START   = new Date('2026-06-01');
export const TL_END     = new Date('2026-09-01');
export const TOTAL_DAYS = (TL_END - TL_START) / 86400000;
const _t = new Date();
_t.setHours(0,0,0,0);
export const TODAY = _t;
const _yyyy = _t.getFullYear();
const _mm = String(_t.getMonth() + 1).padStart(2, '0');
const _dd = String(_t.getDate()).padStart(2, '0');
export const TODAY_STR = `${_yyyy}-${_mm}-${_dd}`;
export const TODAY_DAY = Math.floor((_t.getTime() - TL_START.getTime()) / 86400000);

export const MONTHS_DEF = [
  { label:'Iunie',  start:new Date('2026-06-01'), days:30 },
  { label:'Iulie',  start:new Date('2026-07-01'), days:31 },
  { label:'August', start:new Date('2026-08-01'), days:31 },
];

export const HR_H=56;
export const HR_START=8;
export const HR_END=20;
export const GRID_H=(HR_END-HR_START)*HR_H;
export const TIME_W=46;

export const MONTHS_RO=['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
export const DAY_S=['L','M','Mi','J','V','S','D'];

export const EV_TYPES = {
  meeting:  { label:'Sedinta',  color:'#1E6F64' },
  review:   { label:'Review',   color:'#BC5A77' },
  workshop: { label:'Workshop', color:'#CC9526' },
  focus:    { label:'Focus',    color:'#5E8A55' },
  deadline: { label:'Deadline', color:'#E2664A' },
  other:    { label:'Altele',   color:'#4A6FA5' },
};

export const PALETTE = ['#1E6F64','#E2664A','#CC9526','#5E8A55','#BC5A77','#4A6FA5'];

export const STATUS_META = {
  active:    { label:'In lucru',    color:'#1E6F64', soft:'#E0EEEB' },
  planning:  { label:'Planificat',  color:'#CC9526', soft:'#F6EBD3' },
  'at-risk': { label:'Atentie',     color:'#E2664A', soft:'#FAE6DF' },
  completed: { label:'Finalizat',   color:'#5E8A55', soft:'#E6EEE2' },
};

export const DEF_PROJECTS = [];

export const DEF_TEAM = [];

export const DEF_EVENTS = [];
