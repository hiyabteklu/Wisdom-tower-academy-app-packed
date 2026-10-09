import _aau from "./uni-aau.json";
import _aastu from "./uni-aastu.json";
import _astu from "./uni-astu-adama.json";
import _ju from "./uni-ju.json";
import _mu from "./uni-mu.json";
import _hru from "./uni-hru.json";
import _bdu from "./uni-bdu.json";
import _uog from "./uni-uog.json";
import _hwu from "./uni-hwu.json";
import _amu from "./uni-amu.json";
import _axu from "./uni-axu.json";
import _au from "./uni-au.json";
import _dbu from "./uni-dbu.json";
import _dmu from "./uni-dmu.json";
import _du from "./uni-du.json";
import _ddu from "./uni-ddu.json";
import _wou from "./uni-wou.json";
import _wsu from "./uni-wsu.json";
import _jgu from "./uni-jgu.json";
import _mwu from "./uni-mwu.json";
import _mtu from "./uni-mtu.json";
import _su from "./uni-su.json";
import _kmu from "./uni-kmu.json";
import _agu from "./uni-agu.json";
import _asu from "./uni-asu.json";
import _bhu from "./uni-bhu.json";
import _dbtu from "./uni-dbtu.json";
import _meu from "./uni-meu.json";
import _wcu from "./uni-wcu.json";
import _wku from "./uni-wku.json";
import _wdu from "./uni-wdu.json";
import _aru from "./uni-aru.json";
import _gmu from "./uni-gmu.json";
import _obu from "./uni-obu.json";
import _slu from "./uni-slu.json";
import _dedu from "./uni-dedu.json";
import _dku from "./uni-dku.json";
import _bu from "./uni-bu.json";
import _wru from "./uni-wru.json";
import _jnu from "./uni-jnu.json";
import _kdu from "./uni-kdu.json";
import _iu from "./uni-iu.json";
import _ru from "./uni-ru.json";
import _mkau from "./uni-mkau.json";
import part8 from "./universities-part-8.json";

export type Region =
  | "Addis Ababa"
  | "Amhara"
  | "Oromia"
  | "Tigray"
  | "SNNPR"
  | "Somali"
  | "Afar"
  | "Benishangul Gumuz"
  | "Gambela"
  | "Dire Dawa";

export interface University {
  id: string;
  name: string;
  abbr: string;
  region: Region;
  location: string;
  website: string;
  founded?: string;
  campuses?: string;
  climate?: string;
  distanceFromAddisKm?: number;
  distanceNote?: string;
  elevationM?: number;
  knownFor?: string[];
  strengths: string[];
  whatToExpect: string[];
  tips?: string[];
  studentFit?: string;
  featured?: boolean;
  detailed?: boolean;
}

export const regions: Region[] = [
  "Addis Ababa",
  "Amhara",
  "Oromia",
  "Tigray",
  "SNNPR",
  "Somali",
  "Afar",
  "Benishangul Gumuz",
  "Gambela",
  "Dire Dawa",
];

export const universitiesIntro = {
  title: "Ethiopian Universities",
  subtitle: "What it actually feels like to study at each one",
  paragraphs: [
    "Most people pick a university the way they pick a lottery ticket. They hear a name, feel a flicker of pride or fear, and let that flicker decide four years of their life.",
    "That is backwards. A university is not a prize you win. It is a place you will wake up in, eat in, get sick in, fall behind in, and rebuild yourself in, semester after semester. The name on the certificate matters far less than whether the place fits the person who has to actually live inside it.",
    "Rankings and Wikipedia facts will not tell you what you actually need to know. They will not tell you how strict the department is about attendance, whether the cafeteria food is something you can survive on for four years, how quickly the registrar fixes a mistake on your transcript, or how many of your classmates disappear after first semester because the GPA cutoff caught them. Those are the things that decide whether you finish strong or limp through.",
    "So this is not a comparison of prestige. It is written the way someone who has actually been there, or who has listened closely to people who have, would tell a younger sibling before they leave home. Some of it is uncomfortable. All of it is honest.",
  ],
  closing:
    "Read the one for your university, or the one you are hoping to be placed at. Then read it again in your first month there and see how much of it turns out to be true.",
};

/** All authentic full guides including ASTU Adama. */
export const universities: University[] = [
  _aau as University,
  _aastu as University,
  _astu as University,
  _ju as University,
  _mu as University,
  _hru as University,
  _bdu as University,
  _uog as University,
  _hwu as University,
  _amu as University,
  _axu as University,
  _au as University,
  _dbu as University,
  _dmu as University,
  _du as University,
  _ddu as University,
  _wou as University,
  _wsu as University,
  _jgu as University,
  _mwu as University,
  _mtu as University,
  _su as University,
  _kmu as University,
  _agu as University,
  _asu as University,
  _bhu as University,
  _dbtu as University,
  _meu as University,
  _wcu as University,
  _wku as University,
  _wdu as University,
  _aru as University,
  _gmu as University,
  _obu as University,
  _slu as University,
  _dedu as University,
  _dku as University,
  _bu as University,
  _wru as University,
  _jnu as University,
  _kdu as University,
  _iu as University,
  _ru as University,
  _mkau as University,
  ...(part8 as University[]),
];

export function getUniversity(id: string) {
  return universities.find((u) => u.id === id);
}

export function getFeaturedUniversities() {
  return universities.filter((u) => u.featured);
}

export function getDetailedUniversities() {
  return universities.filter((u) => u.detailed);
}
