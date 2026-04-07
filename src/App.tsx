import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bike, Flag, Trophy, RefreshCw, ChevronRight, Globe } from 'lucide-react';
import data from './data.json';
import auData from './au_data.json';

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

// Map Updater Component
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
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
  const [gameState, setGameState] = useState<'start' | 'playing' | 'special' | 'moving_back' | 'finished'>('start');
  const [shuffledSwiss, setShuffledSwiss] = useState(() => shuffleArray(data.questions));
  const [shuffledAu, setShuffledAu] = useState(() => shuffleArray(auData.questions));
  const [swissIdx, setSwissIdx] = useState(0);
  const [auIdx, setAuIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [routeIdx, setRouteIdx] = useState(0);
  const [consecutiveWrongs, setConsecutiveWrongs] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | 'back' | 'bonus' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const routePoints = data.route;

  // Animation effect for moving back
  useEffect(() => {
    if (gameState === 'moving_back' && routeIdx > 0) {
      const timer = setTimeout(() => {
        setRouteIdx(prev => prev - 1);
      }, 500);
      return () => clearTimeout(timer);
    } else if (gameState === 'moving_back' && routeIdx === 0) {
      setGameState('finished');
    }
  }, [gameState, routeIdx]);

  // Interleaving logic: 3 Swiss, 1 Australian
  const isAuQuestion = (attempts > 0 && (attempts + 1) % 4 === 0);
  const currentQuestion = isAuQuestion 
    ? shuffledAu[auIdx % shuffledAu.length] 
    : shuffledSwiss[swissIdx % shuffledSwiss.length];

  const currentCoords: [number, number] = [routePoints[routeIdx].lat, routePoints[routeIdx].lng];
  const polylinePoints: [number, number][] = routePoints.map(p => [p.lat, p.lng]);

  const handleAnswer = (optionIdx: number) => {
    if (showFeedback || gameState !== 'playing') return;
    
    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuestion.answer;
    setAttempts(a => a + 1);
    
    // Sound Effects Logic
    if (!isAuQuestion) {
      if (isCorrect) {
        const audio = new Audio('sounds/oh-yeah.mp3');
        audio.play().catch(e => console.error("Audio play failed", e));
      } else {
        const audio = new Audio('sounds/postbus.mp3');
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

    if (isAuQuestion) {
      if (isCorrect) {
        setShowFeedback('bonus');
      } else {
        setShowFeedback('incorrect');
      }
    } else {
      if (isCorrect) {
        setShowFeedback('correct');
        setConsecutiveWrongs(0);
      } else {
        const nextWrongs = consecutiveWrongs + 1;
        if (nextWrongs >= 2) {
          setShowFeedback('back');
          setConsecutiveWrongs(0);
        } else {
          setShowFeedback('incorrect');
          setConsecutiveWrongs(nextWrongs);
        }
      }
    }

    setTimeout(() => {
      const wasBack = !isAuQuestion && (showFeedback === 'back' || (optionIdx !== currentQuestion.answer && consecutiveWrongs + 1 >= 2));
      
      setShowFeedback(null);
      setSelectedOption(null);
      
      if (isCorrect) {
        const moveAmount = isAuQuestion ? 2 : 1;
        if (routeIdx + moveAmount < routePoints.length - 1) {
          setRouteIdx(r => r + moveAmount);
        } else {
          setRouteIdx(routePoints.length - 1);
          setGameState('special');
        }
      } else if (wasBack) {
        if (routeIdx > 0) {
          setRouteIdx(r => r - 1);
        }
      }
      
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
    }, 1000);
  };

  const resetGame = () => {
    setShuffledSwiss(shuffleArray(data.questions));
    setShuffledAu(shuffleArray(auData.questions));
    setSwissIdx(0);
    setAuIdx(0);
    setAttempts(0);
    setRouteIdx(0);
    setConsecutiveWrongs(0);
    setGameState('playing');
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-500 to-red-700">
        <div className="swiss-card max-w-lg w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-red-100 shadow-xl overflow-hidden bg-red-600">
              <img src="doctor_t.jpeg" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            Hoi Doctor T!<br />
            <span className="text-red-600">Herzliche Gratulation</span><br />
            zum 60. Geburtstag!
          </h1>
          <p className="text-lg text-gray-600">
            Bist du bereit für deine Nationalpark-Tour? Beweise deine Schweizer-Kenntnisse (und ein bisschen Aussie-Wissen), um ans Ziel zu kommen!
          </p>
          <button 
            onClick={() => setGameState('playing')}
            className="btn-swiss w-full text-xl py-4 flex items-center justify-center gap-2 group"
          >
            Tour Starten <ChevronRight className="group-hover:translate-x-1 transition-transform" />
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
            Gratulation, Doctor T!
          </h1>
          <p className="text-xl text-gray-600">
            Du hast die Tour geschafft und bist ein wahrer Kenner der Schweiz (und Australien)!
          </p>
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-2">Benötigte Fragen</p>
            <p className="text-5xl font-black text-red-600">{attempts}</p>
          </div>
          <div className="space-y-4">
            <p className="italic text-gray-600">
              "Dein Geschenk wartet: Eine Bike-Tour rund um den Schweizer Nationalpark!"
            </p>
            <button 
              onClick={resetGame}
              className="flex items-center justify-center gap-2 mx-auto text-red-600 font-bold hover:underline"
            >
              <RefreshCw className="w-4 h-4" /> Nochmals spielen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row md:h-screen md:overflow-hidden">
      {/* Quiz Section */}
      <div className="w-full h-[60vh] md:h-auto md:w-1/3 p-6 flex flex-col justify-between overflow-y-auto bg-white shadow-2xl z-10">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {gameState === 'special' ? <Trophy className="text-yellow-600 w-6 h-6" /> : (isAuQuestion ? <Globe className="text-blue-600 w-6 h-6" /> : <Flag className="text-red-600 w-6 h-6" />)}
              <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">
                {gameState === 'special' ? 'Letzte Hürde!' : (isAuQuestion ? 'Aussie Bonus!' : 'Tour-Fragen')}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full font-bold text-sm ${gameState === 'special' ? 'bg-yellow-50 text-yellow-600' : (isAuQuestion ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600')}`}>
              {gameState === 'special' ? 'Ziel erreicht!' : (isAuQuestion ? 'G\'day Doctor T!' : 'Doctor T\'s Tour')}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {gameState === 'special' 
                ? "Have you provided Doug yet with a date for the bike tour?"
                : (gameState === 'moving_back' ? "Moment mal..." : currentQuestion.question)}
            </h2>
            
            <div className="flex flex-col gap-3">
              {gameState === 'special' ? (
                ["No, I forgot", "No, it's a very complex decision - I need more time", "No, Doug should pick a random date"].map((option, idx) => (
                  <button
                    key={idx}
                    disabled={!!selectedOption}
                    onClick={() => handleSpecialAnswer(idx)}
                    className={`btn-option ${selectedOption === idx ? 'correct scale-102 border-yellow-500 bg-yellow-50 shadow-md' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 font-semibold text-gray-700">{option}</span>
                    </div>
                  </button>
                ))
              ) : (
                gameState === 'moving_back' ? (
                  <div className="p-8 text-center bg-red-50 rounded-xl border-2 border-red-200 animate-pulse">
                    <p className="text-red-600 font-bold">
                      Falsche Antwort!<br />
                      Du musst zurück zum Start und nochmals über das Datum nachdenken! 😂
                    </p>
                  </div>
                ) : (
                  currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={!!showFeedback}
                      onClick={() => handleAnswer(idx)}
                      className={`btn-option ${
                        selectedOption === idx 
                          ? (showFeedback === 'correct' || showFeedback === 'bonus' ? 'correct scale-102 border-green-500 bg-green-50 shadow-md' : 'incorrect scale-102 border-red-500 bg-red-50 shadow-md') 
                          : (showFeedback && showFeedback !== 'correct' && showFeedback !== 'bonus' && idx === currentQuestion.answer ? 'correct border-green-500' : '')
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:border-red-600 group-hover:text-red-600">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 font-semibold text-gray-700">{option}</span>
                      </div>
                    </button>
                  ))
                )
              )}
            </div>
          </div>
          
          {/* Location Image */}
          <div className="mt-8">
            <div className="swiss-card overflow-hidden h-48 border-t-0 border-b-8 border-swiss-red shadow-lg group">
              <img 
                src={locationImages[routePoints[routeIdx].name] || locationImages["Scuol"]} 
                alt={routePoints[routeIdx].name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                  Aktueller Standort: {routePoints[routeIdx].name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Fortschritt</p>
              <p className="text-sm font-black text-gray-900 uppercase">{routePoints[routeIdx].name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Fragen</p>
              <p className="text-sm font-black text-red-600 uppercase">{attempts}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-red-600 h-full transition-all duration-1000 ease-out"
              style={{ width: `${(routeIdx / (routePoints.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full h-[40vh] md:h-auto md:flex-1 relative z-0">
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
          <Marker position={currentCoords} icon={doctorTIcon}>
            <Popup>
              <div className="text-center font-bold">
                Doctor T auf der Tour!<br />
                📍 {routePoints[routeIdx].name}
              </div>
            </Popup>
          </Marker>
          <MapUpdater center={currentCoords} />
        </MapContainer>

        {/* Feedback Overlay */}
        {showFeedback && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
             <div className={`
               px-8 py-4 rounded-full shadow-2xl text-white font-black text-3xl animate-bounce flex items-center gap-4
               ${(showFeedback === 'correct' || showFeedback === 'bonus') ? 'bg-green-500' : (showFeedback === 'back' ? 'bg-orange-600' : 'bg-red-600')}
             `}>
               {showFeedback === 'correct' ? 'Richtig! ✅' : (showFeedback === 'bonus' ? 'Crikey! +2 Felder! 🇦🇺🚀' : (showFeedback === 'back' ? 'Oje! Zurück... ↩️' : 'Hoppla! ❌'))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
