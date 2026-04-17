import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bike, Flag, Trophy, RefreshCw, ChevronRight, Globe, Volume2, VolumeX } from 'lucide-react';
import data from './data.json';
import auData from './au_data.json';
import fullPathData from './full_path.json';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Doctor T Icon
const doctorTIcon = new L.DivIcon({
  html: `<div class="w-30 h-30 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-black flex items-center justify-center">
           <img src="doctor_t_small.jpeg" className="w-full h-full object-cover object-center scale-110" />
         </div>`,
  className: '',
  iconSize: [120, 120],
  iconAnchor: [60, 60],
});

// Waypoint Icons
const townIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 rounded-full border-2 border-red-600 bg-white flex items-center justify-center shadow-md">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const passIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center shadow-md">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const natureIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 rounded-full border-2 border-green-600 bg-white flex items-center justify-center shadow-md">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7l-2-2-2 2v7"/><path d="M7.03 9.73a4 4 0 0 1 9.94 0"/><path d="M12 13V5"/><path d="M12 13l4 4"/><path d="M12 13l-4 4"/></svg>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const waterIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 rounded-full border-2 border-cyan-600 bg-white flex items-center justify-center shadow-md">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

type Language = 'de' | 'fr' | 'it' | 'rm' | 'en';

const uiTranslations: Record<Language, any> = {
  de: {
    startTitle: "Hoi Doctor T!",
    startCongrat: "Herzliche Gratulation zum 60. Geburtstag!",
    startDesc: "Bist du bereit für deine Nationalpark-Tour? Beweise deine Schweizer-Kenntnisse (und ein bisschen Aussie-Wissen), um ans Ziel zu kommen!",
    startButton: "Tour Starten",
    finishedTitle: "Gratulation, Doctor T!",
    finishedDesc: "Du hast die Tour geschafft und bist ein wahrer Kenner der Schweiz (und Australien)!",
    questionsNeeded: "Benötigte Fragen",
    playAgain: "Nochmals spielen",
    giftDesc: "\"Dein Geschenk wartet: Eine Bike-Tour rund um den Schweizer Nationalpark!\"",
    tourQuestions: "Tour-Fragen",
    aussieBonus: "Aussie Bonus!",
    lastHurdle: "Letzte Hürde!",
    unmute: "Stummschaltung aufheben",
    mute: "Stummschalten",
    goalReached: "Ziel erreicht!",
    gday: "G'day Doctor T!",
    tourTitle: "Doctor T's Tour",
    specialQuestion: "Hast du Doug schon ein Datum für die Bike-Tour genannt?",
    specialOptions: ["Nein, ich habe es vergessen", "Nein, es ist eine sehr komplexe Entscheidung - ich brauche mehr Zeit", "Nein, Doug soll ein zufälliges Datum wählen"],
    momentMal: "Moment mal...",
    wrongAnswerBack: "Falsche Antwort! Du musst zurück zum Start und nochmals über das Datum nachdenken! 😂",
    currentLocation: "Aktueller Standort",
    progress: "Fortschritt",
    questions: "Fragen",
    correct: "Richtig! ✅",
    bonus: "Crikey! +2 Felder! 🇦🇺🚀",
    back: "Oje! Zurück... ↩️",
    hoppla: "Hoppla! ❌"
  },
  fr: {
    startTitle: "Salut Doctor T !",
    startCongrat: "Joyeux 60ème anniversaire !",
    startDesc: "Es-tu prêt pour ton tour du Parc National ? Prouve tes connaissances sur la Suisse (et un peu sur l'Australie) pour atteindre l'objectif !",
    startButton: "Commencer le tour",
    finishedTitle: "Félicitations, Doctor T !",
    finishedDesc: "Tu as terminé le tour et tu es un vrai connaisseur de la Suisse (et de l'Australie) !",
    questionsNeeded: "Questions nécessaires",
    playAgain: "Rejouer",
    giftDesc: "\"Ton cadeau t'attend : Un tour à vélo autour du Parc National Suisse !\"",
    tourQuestions: "Questions du tour",
    aussieBonus: "Bonus Australien !",
    lastHurdle: "Dernier obstacle !",
    unmute: "Activer le son",
    mute: "Couper le son",
    goalReached: "Objectif atteint !",
    gday: "G'day Doctor T !",
    tourTitle: "Le tour de Doctor T",
    specialQuestion: "As-tu déjà donné une date à Doug pour le tour à vélo ?",
    specialOptions: ["Non, j'ai oublié", "Non, c'est une décision très complexe - j'ai besoin de plus de temps", "Non, Doug devrait choisir une date au hasard"],
    momentMal: "Attends une minute...",
    wrongAnswerBack: "Mauvaise response ! Tu dois retourner au départ et réfléchir à nouveau à la date ! 😂",
    currentLocation: "Position actuelle",
    progress: "Progression",
    questions: "Questions",
    correct: "Correct ! ✅",
    bonus: "Crikey ! +2 cases ! 🇦🇺🚀",
    back: "Oups ! En arrière... ↩️",
    hoppla: "Oups ! ❌"
  },
  it: {
    startTitle: "Ciao Doctor T!",
    startCongrat: "Buon 60° compleanno!",
    startDesc: "Sei pronto per il tuo tour del Parco Nazionale? Dimostra le tue conoscenze sulla Svizzera (e un po' sull'Australia) per raggiungere l'obiettivo!",
    startButton: "Inizia il tour",
    finishedTitle: "Congratulazioni, Doctor T!",
    finishedDesc: "Hai completato il tour e sei un vero conoscitore della Svizzera (e dell'Australia)!",
    questionsNeeded: "Domande necessarie",
    playAgain: "Gioca ancora",
    giftDesc: "\"Il tuo regalo ti aspetta: Un tour in bicicletta intorno al Parco Nazionale Svizzero!\"",
    tourQuestions: "Domande del tour",
    aussieBonus: "Bonus Australiano!",
    lastHurdle: "Ultimo ostacolo!",
    unmute: "Riattiva l'audio",
    mute: "Disattiva l'audio",
    goalReached: "Obiettivo raggiunto!",
    gday: "G'day Doctor T!",
    tourTitle: "Il tour di Doctor T",
    specialQuestion: "Hai già dato a Doug una data per il tour in bici?",
    specialOptions: ["No, ho dimenticato", "No, è una decisione molto complessa - ho bisogno di più tempo", "No, Doug dovrebbe scegliere una data a caso"],
    momentMal: "Aspetta un momento...",
    wrongAnswerBack: "Risposta sbagliata! Devi tornare all'inizio e riflettere di nuovo sulla data! 😂",
    currentLocation: "Posizione attuale",
    progress: "Progresso",
    questions: "Domande",
    correct: "Esatto! ✅",
    bonus: "Crikey! +2 caselle! 🇦🇺🚀",
    back: "Ohi! Indietro... ↩️",
    hoppla: "Hoppla! ❌"
  },
  rm: {
    startTitle: "Hoi Doctor T!",
    startCongrat: "Cordiala gratulaziun per il 60avel anniversari!",
    startDesc: "Es ti pront per tia tura tras il Parc Naziunal? Demustra tias enconuschientschas da la Svizra (ed in pau da l'Australia) per arrivar a la finiva!",
    startButton: "Cumenzar la tura",
    finishedTitle: "Gratulaziun, Doctor T!",
    finishedDesc: "Ti has fatg la tura ed es in vair enconuschider da la Svizra (e da l'Australia)!",
    questionsNeeded: "Dumondas duvradas",
    playAgain: "Giugar danovamain",
    giftDesc: "\"Tes dun t'aspetta: Ina tura cun bike enturn il Parc Naziunal Svizzer!\"",
    tourQuestions: "Dumondas da la tura",
    aussieBonus: "Bonus australian!",
    lastHurdle: "Ultima sventira!",
    unmute: "Activar il tun",
    mute: "Deactivar il tun",
    goalReached: "Finiva cuntanschida!",
    gday: "G'day Doctor T!",
    tourTitle: "La tura da Doctor T",
    specialQuestion: "Has ti gia dà a Doug ina data per la tura cun bike?",
    specialOptions: ["Na, jau hai smemblidà quai", "Na, quai è ina decisiun fitg cumplexa - jau dore pli bler temp", "Na, Doug duess tscherner ina data casuala"],
    momentMal: "Spetga in mument...",
    wrongAnswerBack: "Ina faussa resposta! Ti stos turnar al cumenzament e pensar danovamain davart la data! 😂",
    currentLocation: "Posiziun actuala",
    progress: "Progress",
    questions: "Dumondas",
    correct: "Gist! ✅",
    bonus: "Crikey! +2 chomps! 🇦🇺🚀",
    back: "Ohi! Anavos... ↩️",
    hoppla: "Hoppla! ❌"
  },
  en: {
    startTitle: "Hi Doctor T!",
    startCongrat: "Happy 60th Birthday!",
    startDesc: "Are you ready for your National Park tour? Prove your Swiss knowledge (and a bit of Aussie wisdom) to reach the goal!",
    startButton: "Start Tour",
    finishedTitle: "Congratulations, Doctor T!",
    finishedDesc: "You've completed the tour and are a true connoisseur of Switzerland (and Australia)!",
    questionsNeeded: "Questions Needed",
    playAgain: "Play Again",
    giftDesc: "\"Your gift awaits: A bike tour around the Swiss National Park!\"",
    tourQuestions: "Tour Questions",
    aussieBonus: "Aussie Bonus!",
    lastHurdle: "Last Hurdle!",
    unmute: "Unmute",
    mute: "Mute",
    goalReached: "Goal Reached!",
    gday: "G'day Doctor T!",
    tourTitle: "Doctor T's Tour",
    specialQuestion: "Have you already given Doug a date for the bike tour?",
    specialOptions: ["No, I forgot", "No, it's a very complex decision - I need more time", "No, Doug should choose a random date"],
    momentMal: "Wait a minute...",
    wrongAnswerBack: "Wrong answer! You have to go back to the start and think about the date again! 😂",
    currentLocation: "Current Location",
    progress: "Progress",
    questions: "Questions",
    correct: "Correct! ✅",
    bonus: "Crikey! +2 Fields! 🇦🇺🚀",
    back: "Oh no! Back... ↩️",
    hoppla: "Oops! ❌"
  }
};

const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  const supportedLangs: Language[] = ['de', 'fr', 'it', 'rm', 'en'];
  return supportedLangs.includes(browserLang as Language) ? (browserLang as Language) : 'de';
};

// Animated Marker Component that also scrolls the map
function AnimatedMarker({ position, icon, children }: { position: [number, number], icon: any, children?: React.ReactNode }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: false });
  }, [position, map]);

  return (
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const locationImages: Record<string, string> = {
  "Scuol": "images/scuol.jpg",
  "S-charl": "images/s-charl.jpg",
  "Pass da Costainas": "images/pass-costainas.jpg",
  "Tschierv": "images/scuol.jpg", // Fallback
  "Val Mora": "images/val-mora.jpg",
  "Lago di Livigno": "images/lago-livigno.jpg",
  "Livigno": "images/livigno.jpg",
  "Chaschauna Pass": "images/val-mora.jpg",
  "S-chanf": "images/s-chanf.jpg",
  "Zernez": "images/zernez.jpg",
  "Susch": "images/susch.jpg",
  "Lavin": "images/susch.jpg", // Fallback
  "Guarda": "images/scuol.jpg", // Fallback
  "Ardez": "images/scuol.jpg", // Fallback
  "Tarasp": "images/tarasp.jpg",
  "Scuol (Ziel)": "images/scuol-ziel.jpg"
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(getBrowserLanguage);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'special' | 'moving_back' | 'finished'>('start');
  const [shuffledSwiss, setShuffledSwiss] = useState(() => shuffleArray(data.questions));
  const [shuffledAu, setShuffledAu] = useState(() => shuffleArray(auData.questions));
  const [swissIdx, setSwissIdx] = useState(0);
  const [auIdx, setAuIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [targetStageIdx, setTargetStageIdx] = useState(0);
  const [currentPathIdx, setCurrentPathIdx] = useState(0);
  const [consecutiveWrongs, setConsecutiveWrongs] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | 'back' | 'bonus' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const t = uiTranslations[language];

  const routePoints = data.route.map((p, i) => ({
    ...p,
    lat: (fullPathData.fullPath as [number, number][])[fullPathData.stageIndices[i]][0],
    lng: (fullPathData.fullPath as [number, number][])[fullPathData.stageIndices[i]][1],
  }));

  const isMovingRef = useRef(false);
  const bikingAudioRef = useRef<HTMLAudioElement | null>(null);

  // Biking sound effect
  useEffect(() => {
    const targetPathIdx = fullPathData.stageIndices[targetStageIdx];
    const isMoving = currentPathIdx !== targetPathIdx;

    if (isMoving && !bikingAudioRef.current) {
      bikingAudioRef.current = new Audio('sounds/biking.mp3');
      bikingAudioRef.current.loop = true;
    }

    if (isMoving && !isMuted) {
      bikingAudioRef.current?.play().catch(e => console.error("Biking sound failed", e));
    } else {
      if (bikingAudioRef.current) {
        bikingAudioRef.current.pause();
        bikingAudioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (!isMoving && bikingAudioRef.current) {
        bikingAudioRef.current.pause();
      }
    };
  }, [currentPathIdx, targetStageIdx, isMuted]);

  // Effect to move currentPathIdx towards stageIndices[targetStageIdx]
  useEffect(() => {
    const targetPathIdx = fullPathData.stageIndices[targetStageIdx];
    if (currentPathIdx === targetPathIdx) {
      isMovingRef.current = false;
      setCurrentStageIdx(targetStageIdx);
      
      if (targetStageIdx === routePoints.length - 1 && gameState === 'playing') {
        setGameState('special');
      }
      if (gameState === 'moving_back' && targetStageIdx === 0) {
        setGameState('finished');
      }
      return;
    }

    const direction = targetPathIdx > currentPathIdx ? 1 : -1;
    
    // Slow down for the "struggling" effect
    // We want to cover the distance between stages in about 4 seconds
    const currentTargetStageIdx = direction > 0 
      ? routePoints.findIndex((_, i) => fullPathData.stageIndices[i] > currentPathIdx)
      : routePoints.findLastIndex((_, i) => fullPathData.stageIndices[i] < currentPathIdx);
    
    const prevStagePathIdx = fullPathData.stageIndices[Math.max(0, currentTargetStageIdx - 1)];
    const nextStagePathIdx = fullPathData.stageIndices[currentTargetStageIdx];
    const pointsInLeg = Math.abs(nextStagePathIdx - prevStagePathIdx);
    
    const baseInterval = gameState === 'moving_back' ? 1 : 4000 / (pointsInLeg || 1);
    const interval = Math.max(baseInterval, 1); // Don't go faster than 1ms per point

    const timer = setTimeout(() => {
      setCurrentPathIdx(prev => prev + direction);
    }, interval);
    
    return () => clearTimeout(timer);
  }, [currentPathIdx, targetStageIdx, gameState, routePoints, fullPathData.stageIndices]);

  // Interleaving logic: 3 Swiss, 1 Australian
  const isAuQuestion = (attempts > 0 && (attempts + 1) % 4 === 0);
  const currentQuestion: any = isAuQuestion 
    ? shuffledAu[auIdx % shuffledAu.length] 
    : shuffledSwiss[swissIdx % shuffledSwiss.length];

  const currentCoords: [number, number] = (fullPathData.fullPath as [number, number][])[currentPathIdx];
  const polylinePoints = fullPathData.fullPath as [number, number][];

  const handleAnswer = (optionIdx: number) => {
    if (showFeedback || gameState !== 'playing' || isMovingRef.current) return;
    
    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuestion.answer;
    setAttempts(a => a + 1);
    
    // Sound Effects Logic
    if (!isMuted) {
      if (!isAuQuestion) {
        if (isCorrect) {
          const audio = new Audio('sounds/SBB Chime.m4a');
          audio.play().catch(e => console.error("Audio play failed", e));
        } else {
          const audio = new Audio('sounds/oh-yeah.mp3');
          audio.play().catch(e => console.error("Audio play failed", e));
        }
      } else {
        if (isCorrect) {
          const audio = new Audio('sounds/good-boy.mp3');
          audio.play().catch(e => console.error("Audio play failed", e));
        } else {
          const audio = new Audio('sounds/sorry-mate.mp3');
          audio.play().catch(e => console.error("Audio play failed", e));
        }
      }
    }

    let nextFeedback: 'correct' | 'incorrect' | 'back' | 'bonus' | null = null;
    if (isAuQuestion) {
      nextFeedback = isCorrect ? 'bonus' : 'incorrect';
    } else {
      if (isCorrect) {
        nextFeedback = 'correct';
        setConsecutiveWrongs(0);
      } else {
        const nextWrongs = consecutiveWrongs + 1;
        if (nextWrongs >= 2) {
          nextFeedback = 'back';
          setConsecutiveWrongs(0);
        } else {
          nextFeedback = 'incorrect';
          setConsecutiveWrongs(nextWrongs);
        }
      }
    }
    setShowFeedback(nextFeedback);

    // Trigger movement immediately with the sound
    if (isCorrect) {
      const moveAmount = isAuQuestion ? 2 : 1;
      isMovingRef.current = true;
      setTargetStageIdx(prev => Math.min(prev + moveAmount, routePoints.length - 1));
    } else if (nextFeedback === 'back') {
      isMovingRef.current = true;
      setTargetStageIdx(prev => Math.max(prev - 1, 0));
    }

    setTimeout(() => {
      setShowFeedback(null);
      setSelectedOption(null);
      
      if (isAuQuestion) {
        setAuIdx(i => i + 1);
      } else {
        setSwissIdx(i => i + 1);
      }
    }, 1500);
  };

  const handleSpecialAnswer = (idx: number) => {
    setSelectedOption(idx);
    setTimeout(() => {
      setSelectedOption(null);
      setGameState('moving_back');
      isMovingRef.current = true;
      setTargetStageIdx(0);
    }, 1000);
  };

  const resetGame = () => {
    setShuffledSwiss(shuffleArray(data.questions));
    setShuffledAu(shuffleArray(auData.questions));
    setSwissIdx(0);
    setAuIdx(0);
    setAttempts(0);
    setCurrentStageIdx(0);
    setTargetStageIdx(0);
    setCurrentPathIdx(0);
    setConsecutiveWrongs(0);
    setGameState('playing');
  };

  const getLocalizedQuestion = () => {
    if (gameState === 'moving_back') return t.momentMal;
    if (gameState === 'special') return t.specialQuestion;
    return currentQuestion.question[language] || currentQuestion.question['de'];
  };

  const getLocalizedOptions = () => {
    if (gameState === 'special') return t.specialOptions;
    return currentQuestion.options[language] || currentQuestion.options['de'];
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-500 to-red-700">
        <div className="swiss-card max-w-lg w-full p-8 text-center space-y-6">
          <div className="absolute top-4 right-4 flex bg-white/20 rounded-full p-1">
            {(['de', 'fr', 'it', 'rm', 'en'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${language === l ? 'bg-white shadow-sm text-red-600' : 'text-white/60 hover:text-white'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-red-100 shadow-xl overflow-hidden bg-red-600">
              <img src="doctor_t.jpeg" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            {t.startTitle}<br />
            <span className="text-red-600">{t.startCongrat.split('!')[0]}!</span><br />
            {t.startCongrat.split('!')[1]}
          </h1>
          <p className="text-lg text-gray-600">
            {t.startDesc}
          </p>
          <button 
            onClick={() => setGameState('playing')}
            className="btn-swiss w-full text-xl py-4 flex items-center justify-center gap-2 group"
          >
            {t.startButton} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-500 to-red-700">
        <div className="swiss-card max-w-lg w-full p-8 text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-yellow-100 p-6 rounded-full relative">
              <Trophy className="w-16 h-16 text-yellow-600" />
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                ZIEL!
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900">
            {t.finishedTitle}
          </h1>
          <p className="text-xl text-gray-600">
            {t.finishedDesc}
          </p>
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-2">{t.questionsNeeded}</p>
            <p className="text-5xl font-black text-red-600">{attempts}</p>
          </div>
          <div className="space-y-4">
            <p className="italic text-gray-600">
              {t.giftDesc}
            </p>
            <button 
              onClick={resetGame}
              className="flex items-center justify-center gap-2 mx-auto text-red-600 font-bold hover:underline"
            >
              <RefreshCw className="w-4 h-4" /> {t.playAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row md:h-screen md:overflow-hidden landscape:flex-row landscape:h-screen landscape:overflow-hidden">
      {/* Quiz Section */}
      <div className="w-full h-[60vh] md:h-auto md:w-1/3 landscape:w-1/3 landscape:h-auto p-6 flex flex-col justify-between overflow-y-auto bg-white shadow-2xl z-10">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {gameState === 'special' ? <Trophy className="text-yellow-600 w-6 h-6" /> : (isAuQuestion ? <Globe className="text-blue-600 w-6 h-6" /> : <Flag className="text-red-600 w-6 h-6" />)}
              <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">
                {gameState === 'special' ? t.lastHurdle : (isAuQuestion ? t.aussieBonus : t.tourQuestions)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                title={isMuted ? t.unmute : t.mute}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="flex bg-gray-100 rounded-full p-1">
                {(['de', 'fr', 'it', 'rm', 'en'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${language === l ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className={`px-3 py-1 rounded-full font-bold text-sm ${gameState === 'special' ? 'bg-yellow-50 text-yellow-600' : (isAuQuestion ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600')}`}>
                {gameState === 'special' ? t.goalReached : (isAuQuestion ? t.gday : t.tourTitle)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {getLocalizedQuestion()}
            </h2>
            
            <div className="flex flex-col gap-2">
              {gameState === 'moving_back' ? (
                <div className="p-8 text-center bg-red-50 rounded-xl border-2 border-red-200 animate-pulse">
                  <p className="text-red-600 font-bold">
                    {t.wrongAnswerBack}
                  </p>
                </div>
              ) : (
                getLocalizedOptions().map((option: string, idx: number) => (
                  <button
                    key={idx}
                    disabled={!!showFeedback}
                    onClick={() => gameState === 'special' ? handleSpecialAnswer(idx) : handleAnswer(idx)}
                    className={`btn-option ${
                      selectedOption === idx 
                        ? (showFeedback === 'correct' || showFeedback === 'bonus' || gameState === 'special' ? 'correct scale-102 border-green-500 bg-green-50 shadow-md' : 'incorrect scale-102 border-red-500 bg-red-50 shadow-md') 
                        : (showFeedback && showFeedback !== 'correct' && showFeedback !== 'bonus' && idx === currentQuestion.answer ? 'correct border-green-500' : '')
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:border-red-600 group-hover:text-red-600">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 font-semibold text-gray-700 text-sm">{option}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* Location Image */}
          <div className="mt-6 flex-1 min-h-0">
            <div className="swiss-card overflow-hidden h-full border-t-0 border-b-8 border-swiss-red shadow-lg group">
              <img 
                src={locationImages[routePoints[currentStageIdx].name] || locationImages["Scuol"]} 
                alt={routePoints[currentStageIdx].name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                  {t.currentLocation}: {routePoints[currentStageIdx].name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">{t.progress}</p>
              <p className="text-sm font-black text-gray-900 uppercase">{routePoints[currentStageIdx].name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">{t.questions}</p>
              <p className="text-sm font-black text-red-600 uppercase">{attempts}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-red-600 h-full transition-all duration-1000 ease-out"
              style={{ width: `${(currentPathIdx / (polylinePoints.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full h-[40vh] md:h-auto md:flex-1 landscape:flex-1 landscape:h-auto relative z-0">
        <MapContainer 
          center={currentCoords} 
          zoom={12} 
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <Polyline 
            positions={polylinePoints} 
            color="#EF4444" 
            weight={4} 
            opacity={0.6}
            dashArray="10, 10"
          />

          {/* Waypoint Markers */}
          {routePoints.map((point, idx) => {
            const name = point.name.toLowerCase();
            let icon = townIcon;
            if (name.includes('pass') || name.includes('costainas')) icon = passIcon;
            else if (name.includes('lago')) icon = waterIcon;
            else if (name.includes('val')) icon = natureIcon;

            return (
              <Marker 
                key={idx} 
                position={[point.lat, point.lng]} 
                icon={icon}
                eventHandlers={{
                  click: (e) => {
                    if (e.originalEvent.shiftKey) {
                      const newPathIdx = fullPathData.stageIndices[idx];
                      setCurrentPathIdx(newPathIdx);
                      setTargetStageIdx(idx);
                      setCurrentStageIdx(idx);
                    }
                  },
                }}
              >
                <Popup>
                  <div className="text-center font-bold">
                    📍 {point.name}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <AnimatedMarker 
            position={currentCoords} 
            icon={doctorTIcon} 
          >
            <Popup>
              <div className="text-center font-bold">
                Doctor T auf der Tour!<br />
                📍 {routePoints[currentStageIdx].name}
              </div>
            </Popup>
          </AnimatedMarker>
        </MapContainer>

        {/* Feedback Overlay */}
        {showFeedback && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
             <div className={`
               px-8 py-4 rounded-full shadow-2xl text-white font-black text-3xl animate-bounce flex items-center gap-4
               ${(showFeedback === 'correct' || showFeedback === 'bonus') ? 'bg-green-500' : (showFeedback === 'back' ? 'bg-orange-600' : 'bg-red-600')}
             `}>
               {showFeedback === 'correct' ? t.correct : (showFeedback === 'bonus' ? t.bonus : (showFeedback === 'back' ? t.back : t.hoppla))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
