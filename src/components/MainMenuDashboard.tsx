/**
 * MainMenuDashboard.tsx
 * Ultra-Modern 2026 Esports Racing Operations Dashboard for Apex GT.
 * Inspired by Gran Turismo 7 & Formula 1 luxury motorsport editorial design.
 * 
 * Features:
 * - Screen 2 (Root View): 2x3 Panoramic Cards with zero scroll (Career, Garage, Free, School, Multiplayer, Grand Prix)
 * - Screen 3 (Paddock & Preparation Command Center):
 *   - Custom user-uploaded background image (/images/screen3_bg.png) with dark vignette
 *   - Zero-scroll layout (h-screen max-h-screen overflow-hidden flex flex-col justify-between)
 *   - 6 Custom Image Selector Buttons styled like GT7 cards (Circuits, Tires, Laps, AI Difficulty, Livery/Team, Assists/Setup)
 *   - High-fidelity superimposed modal overlays for selecting each configuration element seamlessly
 *   - Master Launch CTA button with audio feedback
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Timer,
  Users,
  Flag,
  Play,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Zap,
  Compass,
  HelpCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Palette,
  Shield,
  Maximize2,
  Minimize2,
  Eye,
  Activity,
  Flame,
  Wind,
  Thermometer,
  Gauge,
  CircleDot,
  Radio,
  Layers,
  ChevronDown,
  GraduationCap,
  Globe,
  Car,
  Coins,
  X,
  Settings,
  Disc,
  Clock,
  Swords,
  User,
  Hash,
  Pencil,
  ChevronLeft,
} from 'lucide-react';
import { CameraDistanceMode, CameraViewMode } from '../game/RacingGameEngine';
import { MultiplayerRoomState } from '../game/multiplayer/MultiplayerClient';
import { RaceDifficulty, RaceLapOption, CustomLiverySettings, CareerSeasonState, saveLivery } from '../game/career/CareerTypes';
import { TireCompoundType } from '../game/physics/TireCompound';
import { playUiClick, playUiHover, playModeSelectChime } from '../utils/uiAudio';
import { CircuitId } from '../game/circuits/ICircuit';
import { AVAILABLE_CIRCUITS } from '../game/circuits/CircuitRegistry';

export interface MainMenuDashboardProps {
  onStartSolo: (
    cameraDistance: CameraDistanceMode,
    cameraMode: CameraViewMode,
    laps: RaceLapOption,
    difficulty: RaceDifficulty,
    startingCompound: TireCompoundType,
    circuitId?: CircuitId
  ) => void;
  onStartCareerMode?: (
    cameraDistance: CameraDistanceMode,
    cameraMode: CameraViewMode,
    laps: RaceLapOption,
    difficulty: RaceDifficulty,
    startingCompound: TireCompoundType,
    circuitId?: CircuitId
  ) => void;
  onOpenLiveryStudio?: () => void;
  customLivery?: CustomLiverySettings;
  careerSeason?: CareerSeasonState;
  onResetCareerSeason?: () => void;
  onStartFreePractice?: (
    cameraDistance: CameraDistanceMode,
    cameraMode: CameraViewMode,
    startingCompound: TireCompoundType,
    circuitId?: CircuitId
  ) => void;
  selectedCircuit?: CircuitId;
  onSelectCircuit?: (circuitId: CircuitId) => void;
  onCreateRoom: (options: {
    playerName: string;
    laps: number;
    car1Name: string;
    car2Name: string;
    crewName: string;
    cameraDistance: CameraDistanceMode;
    cameraMode: CameraViewMode;
  }) => Promise<void>;
  onJoinRoom: (code: string, playerName: string, cameraDistance: CameraDistanceMode, cameraMode: CameraViewMode) => Promise<void>;
  onStartMultiplayerRace: () => void;
  onSetReady: (isReady: boolean) => void;
  onLeaveRoom: () => void;
  onBackToTitle: () => void;
  roomState: MultiplayerRoomState | null;
  playerId: 'p1' | 'p2' | null;
  isConnecting: boolean;
  errorMessage: string | null;
  onStartFreeCamera?: (circuitId?: CircuitId) => void;
  // Deprecated stubs
  onOpenModelUpload?: (target: 'car1' | 'car2' | 'crew') => void;
  car1Name?: string;
  car2Name?: string;
  crewName?: string;
}

export type MenuDedicatedScreen = 'root' | 'career' | 'free' | 'multiplayer' | 'grand_prix';
export type Screen3Overlay = 'none' | 'tires' | 'circuit' | 'laps' | 'difficulty' | 'setup' | 'livery' | 'multiplayer_modal';

export interface EscuderiaPalette {
  id: string;
  name: string;
  stripesColor: string;
  dots: [string, string, string, string];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  driverCode: string;
}

export const ESCUDERIA_PALETTES: EscuderiaPalette[] = [
  {
    id: 'violeta_punk',
    name: 'VIOLETA PUNK',
    stripesColor: '#a855f7',
    dots: ['#8b5cf6', '#d946ef', '#f472b6', '#ffffff'],
    primaryColor: '#3b0764',
    secondaryColor: '#a855f7',
    accentColor: '#f472b6',
    driverCode: 'PUN',
  },
  {
    id: 'rojo_fatuo',
    name: 'ROJO FATUO',
    stripesColor: '#ef4444',
    dots: ['#ef4444', '#dc2626', '#7f1d1d', '#9ca3af'],
    primaryColor: '#1a0507',
    secondaryColor: '#dc2626',
    accentColor: '#f87171',
    driverCode: 'FAT',
  },
  {
    id: 'azul_nebula',
    name: 'AZUL NÉBULA',
    stripesColor: '#0ea5e9',
    dots: ['#0284c7', '#38bdf8', '#7dd3fc', '#ffffff'],
    primaryColor: '#031738',
    secondaryColor: '#0ea5e9',
    accentColor: '#38bdf8',
    driverCode: 'NEB',
  },
  {
    id: 'amarillo_sol',
    name: 'AMARILLO SOL',
    stripesColor: '#eab308',
    dots: ['#eab308', '#facc15', '#fde047', '#94a3b8'],
    primaryColor: '#1c1917',
    secondaryColor: '#eab308',
    accentColor: '#fef08a',
    driverCode: 'SOL',
  },
  {
    id: 'verde_espectro',
    name: 'VERDE ESPECTRO',
    stripesColor: '#10b981',
    dots: ['#10b981', '#34d399', '#06b6d4', '#64748b'],
    primaryColor: '#022c22',
    secondaryColor: '#10b981',
    accentColor: '#6ee7b7',
    driverCode: 'ESP',
  },
  {
    id: 'naranja_fusion',
    name: 'NARANJA FUSIÓN',
    stripesColor: '#f97316',
    dots: ['#f97316', '#fb923c', '#ea580c', '#9ca3af'],
    primaryColor: '#1c1917',
    secondaryColor: '#f97316',
    accentColor: '#fed7aa',
    driverCode: 'FUS',
  },
];

export const MainMenuDashboard: React.FC<MainMenuDashboardProps> = ({
  onStartSolo,
  onStartCareerMode,
  onOpenLiveryStudio,
  customLivery,
  careerSeason,
  onStartFreePractice,
  selectedCircuit: initialCircuit,
  onSelectCircuit,
  onCreateRoom,
  onJoinRoom,
  onStartMultiplayerRace,
  onSetReady,
  onLeaveRoom,
  onBackToTitle,
  roomState,
  playerId,
  isConnecting,
  errorMessage,
  onStartFreeCamera,
}) => {
  // Navigation State: 'root' (Screen 2 Mode Selection) or dedicated mode screen (Screen 3)
  const [activeScreen, setActiveScreen] = useState<MenuDedicatedScreen>('root');

  // Selected Circuit
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitId>(initialCircuit || 'square_apex');

  // Racing Parameters
  const [laps, setLaps] = useState<RaceLapOption>(9);
  const [difficulty, setDifficulty] = useState<RaceDifficulty>('medium');
  const [startingCompound, setStartingCompound] = useState<TireCompoundType>('soft');

  // Camera Settings
  const [cameraDistance, setCameraDistance] = useState<CameraDistanceMode>('medium');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');

  // Driving Assists
  const [tractionControl, setTractionControl] = useState<boolean>(true);
  const [absEnabled, setAbsEnabled] = useState<boolean>(true);
  const [racingLine, setRacingLine] = useState<boolean>(true);

  // Multiplayer Form State
  const [mpTab, setMpTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState<string>(customLivery?.driverName || 'PILOTO APEX');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [mpLaps, setMpLaps] = useState<number>(3);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Controls Guide Modal
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false);

  // GT7 Style Active Card Index on Screen 2
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);

  // Screen 3: Superimposed Modal Overlays
  const [activeOverlay, setActiveOverlay] = useState<Screen3Overlay>('none');
  const [teamName, setTeamName] = useState<string>(customLivery?.teamName || 'VIOLETA PUNK');
  const [carNumber, setCarNumber] = useState<string>(customLivery?.driverNumber || '27');
  const [driverDisplayName, setDriverDisplayName] = useState<string>(customLivery?.driverName || 'ALEX VEGA');
  const [driverCode, setDriverCode] = useState<string>(customLivery?.driverCode || 'PUN');
  const [primaryColor, setPrimaryColor] = useState<string>(customLivery?.primaryColor || '#3b0764');
  const [secondaryColor, setSecondaryColor] = useState<string>(customLivery?.secondaryColor || '#a855f7');
  const [accentColor, setAccentColor] = useState<string>(customLivery?.accentColor || '#f472b6');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(() => {
    if (customLivery?.teamName) {
      const match = ESCUDERIA_PALETTES.find((p) => p.name.toLowerCase() === customLivery.teamName.toLowerCase());
      if (match) return match.id;
    }
    return 'violeta_punk';
  });

  // Live Digital Clock & Date
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => {
    const d = new Date();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      setCurrentDateStr(`${d.getDate()} ${months[d.getMonth()]}`);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
      if (e.key === 'Escape' && activeOverlay !== 'none') {
        setActiveOverlay('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeOverlay]);

  const toggleFullscreen = () => {
    playUiClick(750);
    try {
      if (!document.fullscreenElement) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          root.requestFullscreen().catch(() => {});
        } else if ((root as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
          (root as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
          (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
        }
      }
    } catch {}
  };

  const handleSelectCircuitLocal = (id: CircuitId) => {
    playUiClick(650);
    setSelectedCircuit(id);
    onSelectCircuit?.(id);
  };

  const handleNavigateToScreen = (screen: MenuDedicatedScreen) => {
    playModeSelectChime();
    setActiveScreen(screen);
  };

  const handleBackToGrid = () => {
    playUiClick(700);
    setActiveScreen('root');
    setActiveOverlay('none');
  };

  // Launch handlers for each dedicated screen
  const handleLaunchCareer = () => {
    playUiClick(950);
    if (onStartCareerMode) {
      onStartCareerMode(cameraDistance, cameraMode, laps, difficulty, startingCompound, selectedCircuit);
    } else {
      onStartSolo(cameraDistance, cameraMode, laps, difficulty, startingCompound, selectedCircuit);
    }
  };

  const handleLaunchFreePractice = () => {
    playUiClick(950);
    if (onStartFreePractice) {
      onStartFreePractice(cameraDistance, cameraMode, startingCompound, selectedCircuit);
    } else {
      onStartSolo(cameraDistance, cameraMode, 9, 'easy', startingCompound, selectedCircuit);
    }
  };

  const handleLaunchGrandPrix = () => {
    playUiClick(950);
    onStartSolo(cameraDistance, cameraMode, laps, difficulty, startingCompound, selectedCircuit);
  };

  const handleLaunchFreeCamera = () => {
    playUiClick(750);
    if (onStartFreeCamera) {
      onStartFreeCamera(selectedCircuit);
    } else if (onStartFreePractice) {
      onStartFreePractice(cameraDistance, cameraMode, startingCompound, selectedCircuit);
    }
  };

  const handleCreateRoomAction = async () => {
    playUiClick(850);
    await onCreateRoom({
      playerName: playerName.trim() || 'Piloto Anfitrión',
      laps: mpLaps,
      car1Name: 'F1 Turbo GP (Host)',
      car2Name: 'F1 Turbo GP (Rival)',
      crewName: 'Pit Crew Scuderia',
      cameraDistance,
      cameraMode,
    });
  };

  const handleJoinRoomAction = async () => {
    if (!joinCodeInput.trim()) return;
    playUiClick(850);
    await onJoinRoom(
      joinCodeInput.trim().toUpperCase(),
      playerName.trim() || 'Piloto Invitado',
      cameraDistance,
      cameraMode
    );
  };

  const handleToggleReady = () => {
    playUiClick(800);
    const next = !isReady;
    setIsReady(next);
    onSetReady(next);
  };

  const copyRoomCode = () => {
    if (!roomState?.code) return;
    navigator.clipboard.writeText(roomState.code);
    setIsCopied(true);
    playUiClick(900);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentCircuit = AVAILABLE_CIRCUITS.find((c) => c.id === selectedCircuit) || AVAILABLE_CIRCUITS[0];

  // Career stats calculation
  const playerStanding = careerSeason?.standings?.find((s) => s.isPlayer);
  const playerPoints = playerStanding?.points ?? 0;

  // Estimated race duration calculation
  const calculateEstimatedTime = (totalLaps: number) => {
    const lapTime = currentCircuit.expectedLapTimeSec || 35;
    const totalSecs = lapTime * totalLaps;
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.round(totalSecs % 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Gran Turismo 7 Cards Configuration for Screen 2 (Root View: 4 Core Modes)
  const gt7Cards = [
    {
      id: 'career',
      title: 'MODO CARRERA',
      desc: 'Compite, gana y avanza en tu carrera como piloto profesional.',
      bg: '/images/cards/card_career.webp',
      icon: Trophy,
      action: () => handleNavigateToScreen('career'),
    },
    {
      id: 'free',
      title: 'CONDUCCIÓN LIBRE',
      desc: 'Explora libremente los circuitos y disfruta de la conducción.',
      bg: '/images/cards/card_free.webp',
      icon: Timer,
      action: () => handleNavigateToScreen('free'),
    },
    {
      id: 'multiplayer',
      title: 'MULTIJUGADOR',
      desc: 'Compite en línea con jugadores de todo el mundo en 1v1.',
      bg: '/images/cards/card_multiplayer.webp',
      icon: Globe,
      action: () => handleNavigateToScreen('multiplayer'),
    },
    {
      id: 'grand_prix',
      title: 'GRAN PREMIO',
      desc: 'Parrilla oficial FIA de 5 monoplazas con semáforo y paradas en boxes.',
      bg: '/images/cards/card_grandprix.webp',
      icon: Flag,
      action: () => handleNavigateToScreen('grand_prix'),
    },
  ];

  // Screen 3 Selectors Configuration (Cards with custom background images)
  const screen3Selectors = [
    {
      id: 'circuit',
      category: 'CIRCUITO FIA',
      title: currentCircuit.name,
      subtitle: `${(currentCircuit.totalLength / 1000).toFixed(2)} KM · ${currentCircuit.cornersCount} Curvas`,
      tag: currentCircuit.flagEmoji || '🏁',
      bg: '/images/cards/btn_circuit.webp',
      action: () => {
        playUiClick(750);
        setActiveOverlay('circuit');
      },
    },
    {
      id: 'tires',
      category: 'NEUMÁTICOS',
      title:
        startingCompound === 'soft'
          ? 'BLANDO C4 (ROJO)'
          : startingCompound === 'medium'
          ? 'MEDIO C3 (AMARILLO)'
          : 'DURO C2 (BLANCO)',
      subtitle:
        startingCompound === 'soft'
          ? 'Agarre 100% · 8-10 Vueltas'
          : startingCompound === 'medium'
          ? 'Agarre 92% · 18-22 Vueltas'
          : 'Agarre 84% · 35+ Vueltas',
      tag:
        startingCompound === 'soft' ? '🔴 PIRELLI' : startingCompound === 'medium' ? '🟡 PIRELLI' : '⚪ PIRELLI',
      bg: '/images/cards/btn_tire.webp',
      action: () => {
        playUiClick(750);
        setActiveOverlay('tires');
      },
    },
    {
      id: 'laps',
      category: 'DURACIÓN & VUELTAS',
      title: `${laps} VUELTAS`,
      subtitle: `${calculateEstimatedTime(laps)} · ${
        laps === 9 ? 'Sprint Relámpago' : laps === 20 ? 'Gran Premio Estándar' : 'Resistencia Completa'
      }`,
      tag: '🏁 DISTANCIA',
      bg: '/images/cards/btn_laps.webp',
      action: () => {
        playUiClick(750);
        setActiveOverlay('laps');
      },
    },
    {
      id: 'difficulty',
      category: activeScreen === 'multiplayer' ? 'SALA MULTIJUGADOR' : 'DIFICULTAD RIVALES',
      title:
        activeScreen === 'multiplayer'
          ? roomState
            ? `SALA: ${roomState.code}`
            : 'DUELO 1V1 EN LÍNEA'
          : difficulty === 'easy'
          ? 'NOVATO'
          : difficulty === 'medium'
          ? 'INTERMEDIO'
          : 'LEYENDA FIA',
      subtitle:
        activeScreen === 'multiplayer'
          ? roomState
            ? `Jugadores: ${roomState.players.p1 ? 1 : 0} + ${roomState.players.p2 ? 1 : 0}/2`
            : 'Crear sala privada o unirse con código'
          : difficulty === 'easy'
          ? 'Ritmo accesible y permisivo'
          : difficulty === 'medium'
          ? 'Competitivo y equilibrado'
          : 'Máxima agresividad de parrilla',
      tag: activeScreen === 'multiplayer' ? '🌐 WEBSOCKET' : '⚡ IA DINÁMICA',
      bg: '/images/cards/card_grandprix.webp',
      action: () => {
        playUiClick(750);
        if (activeScreen === 'multiplayer') {
          setActiveOverlay('multiplayer_modal');
        } else {
          setActiveOverlay('difficulty');
        }
      },
    },
    {
      id: 'livery',
      category: 'ESCUDERÍA & PILOTO',
      title: teamName,
      subtitle: `#${carNumber} · ${driverDisplayName} (${driverCode})`,
      tag: '🏎️ MONOPLAZA',
      bg: '/images/cards/btn_livery.webp',
      action: () => {
        playUiClick(750);
        setActiveOverlay('livery');
      },
    },
    {
      id: 'setup',
      category: 'REGLAJES & ASISTENCIAS',
      title: `TC: ${tractionControl ? 'ON' : 'OFF'} · ABS: ${absEnabled ? 'ON' : 'OFF'}`,
      subtitle: `Trazada: ${racingLine ? 'ON' : 'OFF'} · Cámara: ${
        cameraMode === 'chase' ? 'Exterior' : cameraMode === 'bumper' ? 'Morro/Asfalto' : cameraMode === 'hood' ? 'Capó' : 'Órbita'
      }`,
      tag: '🛠️ TELEMETRÍA',
      bg: '/images/cards/btn_helmet.webp',
      action: () => {
        playUiClick(750);
        setActiveOverlay('setup');
      },
    },
  ];

  // Arrow key navigation for 2x2 cards in root menu
  useEffect(() => {
    if (activeScreen !== 'root' || showControlsModal || activeOverlay !== 'none') return;
    const handleMenuNav = (e: KeyboardEvent) => {
      const total = gt7Cards.length;
      if (total === 0) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        playUiHover();
        setSelectedCardIndex((prev) => (prev + 1) % total);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playUiHover();
        setSelectedCardIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playUiHover();
        setSelectedCardIndex((prev) => (prev + 2) % total);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        playUiHover();
        setSelectedCardIndex((prev) => (prev - 2 + total) % total);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const c = gt7Cards[selectedCardIndex];
        if (c) c.action();
      }
    };
    window.addEventListener('keydown', handleMenuNav);
    return () => window.removeEventListener('keydown', handleMenuNav);
  }, [activeScreen, selectedCardIndex, showControlsModal, activeOverlay, gt7Cards]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between h-screen max-h-screen overflow-hidden select-none text-white font-sans bg-neutral-950">
      {/* ========================================================================= */}
      {/* BACKGROUND IMAGE: Root GT7 vs Screen 3 User Uploaded Background Image    */}
      {/* ========================================================================= */}
      <img
        src={activeScreen === 'root' ? '/images/dashboard_bg.webp' : '/images/screen3_bg.webp'}
        alt="Racing Background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-95 select-none z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/35 to-neutral-950/75 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-neutral-950/20 to-neutral-950/60 pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 1. TOP HEADER / FULLSCREEN ACTION                                         */}
      {/* ========================================================================= */}
      {activeScreen === 'root' ? (
        /* Screen 2: No top bar or letters, only fullscreen button with nearly transparent background */
        <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-30">
          <button
            onClick={toggleFullscreen}
            onMouseEnter={playUiHover}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur-sm shadow-sm"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        /* Screen 3 Top Header matching the luxury motorsport styling */
        <header className="relative z-20 w-full border-b border-white/10 bg-neutral-950/85 backdrop-blur-xl px-2.5 sm:px-6 py-1 sm:py-1.5 flex items-center justify-between flex-shrink-0 shadow-lg">
          {/* Left: Mode Title & F1 Badge without '2026' and without 'CONFIGURACIÓN' */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="px-1.5 sm:px-2 py-0.5 rounded bg-red-600 text-white font-black italic tracking-tighter text-xs sm:text-sm font-mono shadow-md border border-red-400/40">
                F1
              </div>
            </div>

            <div className="leading-tight truncate">
              <h2 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-white font-sans flex items-center gap-1.5 truncate">
                <span className="truncate">
                  {activeScreen === 'career' && 'MODO CARRERA'}
                  {activeScreen === 'free' && 'ENTRENAMIENTO & TIME ATTACK'}
                  {activeScreen === 'multiplayer' && 'PADDOCK MULTIJUGADOR 1V1'}
                  {activeScreen === 'grand_prix' && 'GRAN PREMIO OFICIAL FIA'}
                </span>
              </h2>
            </div>
          </div>

          {/* Right: Back Button & Fullscreen Button (Interchanged so Fullscreen is at the far right) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Back Button to return to Screen 2 */}
            <button
              onClick={handleBackToGrid}
              onMouseEnter={playUiHover}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-100 hover:text-white transition-all text-xs font-bold cursor-pointer shadow-md"
              title="Volver a selección de modalidades"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>MODOS</span>
            </button>

            {/* Fullscreen Button - At the far right where MODOS used to be */}
            <button
              onClick={toggleFullscreen}
              onMouseEnter={playUiHover}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              className="p-1 sm:p-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT VIEWPORT: ZERO-SCROLL FOR BOTH SCREENS                    */}
      {/* ========================================================================= */}
      {activeScreen === 'root' ? (
        /* SCREEN 2: 2x2 Mode Selection Grid (40% Button Opacity & Maximized Space) */
        <main className="relative z-10 flex-1 flex flex-col justify-between px-3 sm:px-6 md:px-8 py-3.5 sm:py-5 max-w-7xl mx-auto w-full min-h-0 overflow-hidden">
          {/* Top Title Banner */}
          <div className="flex-shrink-0 mb-1.5 sm:mb-2.5 text-left">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-wide text-white drop-shadow font-sans">
              UN MUNDO DE AUTOMOVILISMO
            </h1>
            <p className="text-[11px] sm:text-xs text-neutral-300 font-normal">
              Elige tu forma de disfrutar Apex GT.
            </p>
          </div>

          {/* 4 Cards Grid in 2x2 with 57% opacity & 40% narrower buttons for a clean open center */}
          <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-y-3 sm:gap-y-4 md:gap-y-5 w-full items-stretch my-auto">
            {gt7Cards.map((card, idx) => {
              const Icon = card.icon;
              const isSelected = selectedCardIndex === idx;
              const isLeftColumn = idx % 2 === 0;
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    setSelectedCardIndex(idx);
                    playUiClick(800);
                    card.action();
                  }}
                  onMouseEnter={() => {
                    setSelectedCardIndex(idx);
                    playUiHover();
                  }}
                  className={`group relative rounded-xl sm:rounded-2xl overflow-hidden text-left cursor-pointer transition-all duration-300 flex flex-col justify-end p-2.5 sm:p-3.5 md:p-4 select-none bg-neutral-950/[0.57] backdrop-blur-sm ${
                    isLeftColumn ? 'justify-self-start w-[64%] sm:w-[60%]' : 'justify-self-end w-[64%] sm:w-[60%]'
                  } ${
                    isSelected
                      ? 'border-2 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.65),inset_0_0_12px_rgba(34,211,238,0.2)] ring-1 ring-cyan-300 scale-[1.01]'
                      : 'border border-white/20 hover:border-cyan-400/80 hover:shadow-[0_0_16px_rgba(34,211,238,0.35)]'
                  }`}
                >
                  {/* Background Image with 57% opacity */}
                  <img
                    src={card.bg}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.57] transition-transform duration-500 ease-out group-hover:scale-108"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors pointer-events-none" />

                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" />
                  )}

                  <div className="relative z-10 flex flex-col justify-end">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                      <div className="p-1 sm:p-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 group-hover:text-cyan-200 shrink-0">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white drop-shadow font-sans truncate">
                        {card.title}
                      </span>
                    </div>
                    <p className="text-[8.5px] sm:text-[10px] md:text-[11px] text-neutral-300 line-clamp-1 sm:line-clamp-2 mt-0.5 font-normal leading-tight">
                      {card.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      ) : (
        /* SCREEN 3: Custom Background + 6 Selector Buttons (60% Opacity) + Zero-Scroll Responsive Layout */
        <main className="relative z-10 flex-1 flex flex-col px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 max-w-7xl mx-auto w-full min-h-0 overflow-hidden">
          
          {/* ========================================================================= */}
          {/* LAYOUT A: LANDSCAPE VIEWPORT (Horizontal Phone/Desktop: Left Minimalist Panel + 3x2 Grid) */}
          {/* ========================================================================= */}
          <div className="hidden landscape:flex flex-row gap-2 sm:gap-3 flex-1 min-h-0 items-stretch">
            {/* Left Technical Specification Panel (Exact replica of user design, optimized for compact viewports) */}
            <aside className="w-56 sm:w-64 md:w-72 flex-shrink-0 flex flex-col justify-between rounded-2xl bg-[#0b0c10]/95 backdrop-blur-xl border border-white/10 p-2 sm:p-2.5 md:p-3.5 shadow-[0_0_30px_rgba(0,0,0,0.85)] min-h-0 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-16 before:h-16 before:border-t-2 before:border-l-2 before:border-red-600 before:rounded-tl-2xl before:pointer-events-none">
              
              {/* Header: Glowing Red Dot + FICHA TÉCNICA + FIA Badge */}
              <div className="flex-shrink-0 border-b border-white/10 pb-1.5 mb-1 sm:pb-2 sm:mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,1)]" />
                  <span className="text-[11px] sm:text-xs md:text-sm font-bold tracking-wider text-white font-sans uppercase">
                    FICHA TÉCNICA
                  </span>
                </div>
                <div className="flex items-center justify-center px-1.5 py-0.5 rounded-full border border-white/60 bg-white/5 backdrop-blur-sm">
                  <span className="text-[8.5px] sm:text-[9.5px] font-black tracking-wider text-white font-serif leading-none">
                    FIA
                  </span>
                </div>
              </div>

              {/* 6 Clean Technical Rows separated by subtle lines */}
              <div className="flex-1 min-h-0 flex flex-col justify-between py-0.5 overflow-hidden">
                {/* 1. Circuito */}
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('circuit'); }}
                  className="flex items-center gap-2 sm:gap-2.5 py-0.5 sm:py-1 px-1 hover:bg-white/[0.04] rounded transition-colors cursor-pointer border-b border-white/[0.08]"
                >
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/90 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 22V3" strokeLinecap="round" />
                    <path d="M4 4h14l-2 5 2 5H4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 4v10M12 4v10M16 4v10" opacity="0.6" />
                  </svg>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-neutral-400 font-sans leading-none">
                      CIRCUITO
                    </span>
                    <span className="text-[11px] sm:text-xs md:text-[13px] font-bold text-white font-sans truncate leading-tight mt-0.5">
                      {currentCircuit.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-neutral-400 font-sans truncate leading-none mt-0.5">
                      {(currentCircuit.totalLength / 1000).toFixed(1)} km · {currentCircuit.cornersCount} Curvas
                    </span>
                  </div>
                </div>

                {/* 2. Neumático */}
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('tires'); }}
                  className="flex items-center gap-2 sm:gap-2.5 py-0.5 sm:py-1 px-1 hover:bg-white/[0.04] rounded transition-colors cursor-pointer border-b border-white/[0.08]"
                >
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/90 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="4.5" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    <path d="M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21" strokeLinecap="round" />
                  </svg>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-neutral-400 font-sans leading-none">
                      NEUMÁTICO
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                          startingCompound === 'soft'
                            ? 'bg-red-600 shadow-[0_0_6px_rgba(239,68,68,1)]'
                            : startingCompound === 'medium'
                            ? 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,1)]'
                            : 'bg-white shadow-[0_0_6px_rgba(255,255,255,1)]'
                        }`}
                      />
                      <span className="text-[11px] sm:text-xs md:text-[13px] font-bold text-white uppercase font-sans truncate leading-tight">
                        {startingCompound === 'soft' ? 'BLANDO C4 (ROJO)' : startingCompound === 'medium' ? 'MEDIO C3 (AMARILLO)' : 'DURO C2 (BLANCO)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Distancia */}
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('laps'); }}
                  className="flex items-center gap-2 sm:gap-2.5 py-0.5 sm:py-1 px-1 hover:bg-white/[0.04] rounded transition-colors cursor-pointer border-b border-white/[0.08]"
                >
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/90 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="13" r="8" />
                    <path d="M12 9v4l2.5 2.5" />
                    <path d="M12 2v3M10 2h4" />
                  </svg>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-neutral-400 font-sans leading-none">
                      DISTANCIA
                    </span>
                    <span className="text-[11px] sm:text-xs md:text-[13px] font-bold text-white font-sans uppercase truncate leading-tight mt-0.5">
                      {laps} VUELTAS
                    </span>
                  </div>
                </div>

                {/* 4. Dificultad IA */}
                <div
                  onClick={() => { playUiClick(700); if (activeScreen === 'multiplayer') setActiveOverlay('multiplayer_modal'); else setActiveOverlay('difficulty'); }}
                  className="flex items-center gap-2 sm:gap-2.5 py-0.5 sm:py-1 px-1 hover:bg-white/[0.04] rounded transition-colors cursor-pointer border-b border-white/[0.08]"
                >
                  <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/90 fill-white/80 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-neutral-400 font-sans leading-none">
                      {activeScreen === 'multiplayer' ? 'SALA MULTIJUGADOR' : 'DIFICULTAD IA'}
                    </span>
                    <span className="text-[11px] sm:text-xs md:text-[13px] font-bold text-white font-sans uppercase truncate leading-tight mt-0.5">
                      {activeScreen === 'multiplayer' ? (roomState ? `SALA ${roomState.code}` : '1V1 ONLINE') : difficulty === 'easy' ? 'NOVATO' : difficulty === 'medium' ? 'INTERMEDIO' : 'LEYENDA FIA'}
                    </span>
                  </div>
                </div>

                {/* 5. Piloto & Escudería */}
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('livery'); }}
                  className="flex items-center gap-2 sm:gap-2.5 py-0.5 sm:py-1 px-1 hover:bg-white/[0.04] rounded transition-colors cursor-pointer border-b border-white/[0.08]"
                >
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/90 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4C7.03 4 3 8.03 3 13c0 3.2 1.68 6.01 4.2 7.6.28.18.63.15.88-.07l2.8-2.53H14c4.42 0 8-3.58 8-8 0-4.97-4.03-9-10-9zm2 10H8.5c-.83 0-1.5-.67-1.5-1.5S7.67 11 8.5 11H14c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
                  </svg>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-neutral-400 font-sans leading-none">
                      PILOTO & ESCUDERÍA
                    </span>
                    <span className="text-[11px] sm:text-xs md:text-[13px] font-bold text-white font-sans truncate leading-tight mt-0.5">
                      #{carNumber} · {driverDisplayName}
                    </span>
                  </div>
                </div>

                {/* 6. Asistencias */}
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('setup'); }}
                  className="flex items-center gap-2 sm:gap-2.5 py-0.5 sm:py-1 px-1 hover:bg-white/[0.04] rounded transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/90 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
                  </svg>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-neutral-400 font-sans leading-none">
                      ASISTENCIAS
                    </span>
                    <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-white/90 font-sans truncate leading-tight mt-0.5">
                      TC: {tractionControl ? 'ON' : 'OFF'} · ABS: {absEnabled ? 'ON' : 'OFF'} · Línea: {racingLine ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Button at Bottom of Sidebar: Compact Slanted Ferrari-Red Parallelogram */}
              <div className="flex-shrink-0 pt-0.5 sm:pt-1 relative mt-0.5">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/30 via-rose-500/10 to-red-600/30 blur-xs rounded pointer-events-none" />
                <button
                  onClick={() => {
                    playUiClick(850);
                    if (activeScreen === 'career') handleLaunchCareer();
                    else if (activeScreen === 'free') handleLaunchFreePractice();
                    else if (activeScreen === 'multiplayer') {
                      if (roomState) handleLaunchCareer();
                      else setActiveOverlay('multiplayer_modal');
                    } else if (activeScreen === 'grand_prix') handleLaunchGrandPrix();
                  }}
                  onMouseEnter={playUiHover}
                  className="relative w-full py-1 sm:py-1.5 px-2.5 [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)] bg-gradient-to-r from-[#d90429] via-[#ef233c] to-[#d90429] hover:from-[#ef233c] hover:via-[#ff4d6d] hover:to-[#ef233c] text-white font-black text-[11px] sm:text-xs tracking-wider sm:tracking-widest uppercase transition-all duration-200 shadow-[0_0_12px_rgba(239,35,60,0.45)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <Play className="w-3 h-3 fill-white text-white shrink-0 ml-0.5" />
                  <span className="font-sans font-black tracking-[0.14em] drop-shadow-sm">INICIAR</span>
                </button>
              </div>
            </aside>

            {/* Right: 6 Selector Buttons (3 cols x 2 rows, 60% opacity) */}
            <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-1.5 items-stretch h-full">
              {screen3Selectors.map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.action}
                  onMouseEnter={playUiHover}
                  className="group relative rounded-xl overflow-hidden text-left cursor-pointer transition-all duration-300 flex flex-col justify-between p-1.5 sm:p-2 select-none border border-white/20 hover:border-red-500/80 hover:shadow-[0_0_14px_rgba(239,68,68,0.4)] hover:scale-[1.01]"
                >
                  {/* Background Image: exactly 60% opacity */}
                  <img
                    src={btn.bg}
                    alt={btn.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />

                  {/* ONLY BIG LETTERS / TITLE */}
                  <div className="relative z-10 flex items-center justify-between gap-1 w-full">
                    <span className="text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-wide text-white drop-shadow truncate font-sans">
                      {btn.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-400 transition-colors shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LAYOUT B: PORTRAIT VIEWPORT (Vertical Phone: Minimalist Top Bar + 2x3 Grid) */}
          {/* ========================================================================= */}
          <div className="flex landscape:hidden flex-col gap-1.5 flex-1 min-h-0">
            {/* Top Minimalist Summary Bar (arriba) */}
            <div className="flex-shrink-0 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-white/15 p-1.5 shadow-lg">
              {/* Row 1: Title + Action Button */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-white font-mono">
                    RESUMEN TÉCNICO FIA
                  </span>
                </div>
                <div className="w-32">
                  {activeScreen === 'career' && (
                    <button
                      onClick={handleLaunchCareer}
                      onMouseEnter={playUiHover}
                      className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-[9px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>INICIAR</span>
                    </button>
                  )}
                  {activeScreen === 'free' && (
                    <button
                      onClick={handleLaunchFreePractice}
                      onMouseEnter={playUiHover}
                      className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-neutral-950 font-black text-[9px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>A PISTA</span>
                    </button>
                  )}
                  {activeScreen === 'multiplayer' && (
                    <button
                      onClick={() => { playUiClick(850); setActiveOverlay('multiplayer_modal'); }}
                      onMouseEnter={playUiHover}
                      className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-neutral-950 font-black text-[9px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      <span>{roomState ? 'GESTIONAR' : 'UNIRSE'}</span>
                    </button>
                  )}
                  {activeScreen === 'grand_prix' && (
                    <button
                      onClick={handleLaunchGrandPrix}
                      onMouseEnter={playUiHover}
                      className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-400 text-white font-black text-[9px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>INICIAR GP</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: 6 Quick Horizontal Summary Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-[8px] font-mono">
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('circuit'); }}
                  className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/10 text-center truncate cursor-pointer"
                >
                  <span className="text-neutral-400">🏁 </span>
                  <span className="text-white font-bold truncate">{currentCircuit.name}</span>
                </div>
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('tires'); }}
                  className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/10 text-center truncate cursor-pointer flex items-center justify-center gap-1"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      startingCompound === 'soft' ? 'bg-red-500' : startingCompound === 'medium' ? 'bg-yellow-400' : 'bg-white'
                    }`}
                  />
                  <span className="text-white font-bold truncate">{startingCompound.toUpperCase()}</span>
                </div>
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('laps'); }}
                  className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/10 text-center truncate cursor-pointer"
                >
                  <span className="text-neutral-400">⏱️ </span>
                  <span className="text-amber-300 font-bold">{laps}V</span>
                </div>
                <div
                  onClick={() => { playUiClick(700); if (activeScreen === 'multiplayer') setActiveOverlay('multiplayer_modal'); else setActiveOverlay('difficulty'); }}
                  className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/10 text-center truncate cursor-pointer"
                >
                  <span className="text-neutral-400">⚡ </span>
                  <span className="text-white font-bold truncate">{difficulty.toUpperCase()}</span>
                </div>
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('livery'); }}
                  className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/10 text-center truncate cursor-pointer"
                >
                  <span className="text-neutral-400">🏎️ </span>
                  <span className="text-white font-bold truncate">#{carNumber} {driverCode}</span>
                </div>
                <div
                  onClick={() => { playUiClick(700); setActiveOverlay('setup'); }}
                  className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/10 text-center truncate cursor-pointer"
                >
                  <span className="text-neutral-400">🛠️ </span>
                  <span className="text-emerald-400 font-bold">TC:{tractionControl ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>

            {/* 6 Selector Buttons Grid (2 cols x 3 rows, 60% opacity) */}
            <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-3 gap-1.5 items-stretch">
              {screen3Selectors.map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.action}
                  onMouseEnter={playUiHover}
                  className="group relative rounded-xl overflow-hidden text-left cursor-pointer transition-all duration-300 flex flex-col justify-between p-2 select-none border border-white/20 hover:border-red-500/80 hover:shadow-[0_0_14px_rgba(239,68,68,0.4)] hover:scale-[1.01]"
                >
                  {/* Background Image: exactly 60% opacity */}
                  <img
                    src={btn.bg}
                    alt={btn.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />

                  {/* ONLY BIG LETTERS / TITLE */}
                  <div className="relative z-10 flex items-center justify-between gap-1 w-full">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-white drop-shadow truncate font-sans">
                      {btn.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-400 transition-colors shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 4. SUPERIMPOSED OVERLAYS (PANTALLAS SUPERPUESTAS)                         */}
      {/* ========================================================================= */}

      {/* OVERLAY 1: TIRES SELECTION MODAL - REDESIGNED IDENTICAL TO REFERENCE DESIGN */}
      {activeOverlay === 'tires' && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex flex-col justify-between p-3 sm:p-5 md:p-6 lg:p-8 animate-in fade-in duration-200 select-none bg-black">
          {/* Cinema-grade F1 Garage Pitlane Background with floor reflections */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src="/images/tire_strategy_full_bg.webp"
              alt="Estrategia de Neumáticos"
              className="w-full h-full object-cover brightness-[0.72] contrast-[1.08] select-none pointer-events-none"
            />
            {/* Ambient vignette and floor reflection depth */}
            <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_20%,rgba(5,7,11,0.85)_100%] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />
          </div>

          {/* Top Header Bar */}
          <div className="relative z-10 flex items-start justify-between w-full max-w-7xl mx-auto mb-2 sm:mb-4">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Slanted red speed chevrons /// */}
              <div className="flex items-center gap-1 mt-1 sm:mt-1.5 shrink-0">
                <span className="w-1.5 h-6 sm:h-7 -skew-x-[25deg] bg-red-600 block shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="w-1.5 h-6 sm:h-7 -skew-x-[25deg] bg-red-600 block shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="w-2.5 h-6 sm:h-7 -skew-x-[25deg] bg-red-600 block shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black italic tracking-wider text-white uppercase font-sans drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  ESTRATEGIA DE NEUMÁTICOS
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-neutral-300 font-medium tracking-wide mt-0.5 drop-shadow">
                  Selecciona el compuesto según agarre, temperatura y duración.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playUiClick(700);
                setActiveOverlay('none');
              }}
              onMouseEnter={playUiHover}
              className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:scale-110 transition-transform cursor-pointer"
              title="Cerrar"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" />
            </button>
          </div>

          {/* Center 3 Compound Cards */}
          <div className="relative z-10 w-full max-w-7xl mx-auto my-auto py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-stretch">
              {[
                {
                  id: 'soft' as TireCompoundType,
                  name: 'BLANDO',
                  code: 'C4',
                  image: '/images/tire_soft_render.png',
                  codeColor: 'text-red-500',
                  grip: '100%',
                  gripColor: 'text-red-500',
                  desc: 'Máximo agarre instantáneo y tracción en curva.',
                  thermalDegrad: 'ALTA DEGRADACIÓN TÉRMICA',
                  thermalSegments: 5,
                  laps: '8–10 VUELTAS',
                  lapsColor: 'text-red-500',
                  tempOptima: '90° – 110°C',
                  tempSegmentsCount: 4,
                  wearSegments: 5,
                  accentColor: 'red',
                  barColor: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]',
                  iconColor: 'text-red-500',
                  glowColor: 'rgba(239,68,68,0.5)',
                  topBorder: '',
                },
                {
                  id: 'medium' as TireCompoundType,
                  name: 'MEDIO',
                  code: 'C3',
                  image: '/images/tire_medium_render.png',
                  codeColor: 'text-yellow-400',
                  grip: '92%',
                  gripColor: 'text-yellow-400',
                  desc: 'Equilibrio ideal para tandas medias y estrategias estándar.',
                  thermalDegrad: 'DEGRADACIÓN MEDIA',
                  thermalSegments: 3,
                  laps: '18–25 VUELTAS',
                  lapsColor: 'text-white',
                  tempOptima: '80° – 100°C',
                  tempSegmentsCount: 3,
                  wearSegments: 3,
                  accentColor: 'yellow',
                  barColor: 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.7)]',
                  iconColor: 'text-yellow-400',
                  glowColor: 'rgba(250,204,21,0.5)',
                  topBorder: 'border-t-2 border-t-yellow-400/80',
                },
                {
                  id: 'hard' as TireCompoundType,
                  name: 'DURO',
                  code: 'C2',
                  image: '/images/tire_hard_render.png',
                  codeColor: 'text-neutral-200',
                  grip: '84%',
                  gripColor: 'text-white',
                  desc: 'Baja degradación para stints largos o una sola parada.',
                  thermalDegrad: 'MÍNIMA DEGRADACIÓN',
                  thermalSegments: 1,
                  laps: '35+ VUELTAS',
                  lapsColor: 'text-white',
                  tempOptima: '70° – 90°C',
                  tempSegmentsCount: 2,
                  wearSegments: 1,
                  accentColor: 'white',
                  barColor: 'bg-neutral-200 shadow-[0_0_6px_rgba(255,255,255,0.7)]',
                  iconColor: 'text-neutral-300',
                  glowColor: 'rgba(255,255,255,0.4)',
                  topBorder: 'border-t-2 border-t-white/70',
                },
              ].map((tire) => {
                const isSelected = startingCompound === tire.id;
                return (
                  <button
                    key={tire.id}
                    onClick={() => {
                      playUiClick(750);
                      setStartingCompound(tire.id);
                    }}
                    onMouseEnter={playUiHover}
                    className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden bg-[#0a0c12]/92 backdrop-blur-md ${
                      isSelected
                        ? tire.id === 'soft'
                          ? 'border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.45),inset_0_0_15px_rgba(239,68,68,0.12)] scale-[1.01]'
                          : tire.id === 'medium'
                          ? 'border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.45),inset_0_0_15px_rgba(250,204,21,0.12)] scale-[1.01]'
                          : 'border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.4),inset_0_0_15px_rgba(255,255,255,0.12)] scale-[1.01]'
                        : `border border-white/10 ${tire.topBorder} hover:border-white/30 hover:bg-[#0e111a]/95`
                    }`}
                  >
                    {/* Top right checkmark badge when selected */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            tire.id === 'soft'
                              ? 'bg-red-500/20 text-red-500 border border-red-500/60'
                              : tire.id === 'medium'
                              ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/60'
                              : 'bg-white/20 text-white border border-white/60'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </div>
                    )}

                    {/* Upper Section: Tire 3D Render & Detailed Specs */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* 3D Tire Render with realistic asphalt reflection */}
                      <div className="relative shrink-0 w-28 sm:w-32 md:w-28 lg:w-36 flex items-center justify-center py-1">
                        <img
                          src={tire.image}
                          alt={`${tire.name} ${tire.code}`}
                          className="w-full h-auto max-h-44 sm:max-h-52 object-contain select-none pointer-events-none transform group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]"
                          loading="eager"
                        />
                      </div>

                      {/* Specs Column */}
                      <div className="flex-1 min-w-0 pr-1">
                        {/* Title: NAME CODE */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg sm:text-xl lg:text-2xl font-black italic tracking-wide text-white font-sans">
                            {tire.name}
                          </span>
                          <span className={`text-lg sm:text-xl lg:text-2xl font-black italic font-sans ${tire.codeColor}`}>
                            {tire.code}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-[10px] sm:text-[11px] text-neutral-300 leading-snug mt-1 font-medium line-clamp-2">
                          {tire.desc}
                        </p>

                        {/* Grip Row: / 100% AGARRE */}
                        <div className="flex items-baseline gap-1.5 mt-2.5">
                          <span className={`text-sm sm:text-base font-bold ${tire.gripColor}`}>/</span>
                          <span className={`text-base sm:text-lg lg:text-xl font-black font-mono tracking-tight ${tire.gripColor}`}>
                            {tire.grip}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-neutral-400 uppercase font-sans">
                            AGARRE
                          </span>
                        </div>

                        {/* Thermal Degradation Row with 5 Segments */}
                        <div className="mt-2">
                          <div className="flex items-center gap-1.5 text-neutral-300">
                            <Thermometer className={`w-3.5 h-3.5 shrink-0 ${tire.iconColor}`} />
                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-neutral-300 truncate">
                              {tire.thermalDegrad}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((segIndex) => {
                              const isFilled = segIndex <= tire.thermalSegments;
                              return (
                                <span
                                  key={segIndex}
                                  className={`h-1.5 flex-1 rounded-xs transition-colors ${
                                    isFilled ? tire.barColor : 'bg-neutral-800'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Stint Laps Row */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock className={`w-3.5 h-3.5 shrink-0 ${tire.iconColor}`} />
                          <span className={`text-[11px] sm:text-xs font-black font-mono tracking-wide ${tire.lapsColor}`}>
                            {tire.laps}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subtle horizontal separation */}
                    <div className="border-t border-white/10 my-3" />

                    {/* Bottom metrics sub-bar: Temp. Óptima & Desgaste */}
                    <div className="grid grid-cols-2 gap-2 text-left px-1">
                      {/* Temp. Óptima */}
                      <div>
                        <div className="flex items-center gap-1 text-neutral-400">
                          <Thermometer className={`w-3.5 h-3.5 shrink-0 ${tire.iconColor}`} />
                          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                            TEMP. ÓPTIMA
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xs font-bold text-white font-mono mt-0.5">
                          {tire.tempOptima}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((idx) => {
                            const active = idx <= tire.tempSegmentsCount;
                            return (
                              <span
                                key={idx}
                                className={`h-1 flex-1 rounded-xs ${
                                  active ? tire.barColor : 'bg-neutral-800'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Desgaste */}
                      <div>
                        <div className="flex items-center gap-1 text-neutral-400">
                          <CircleDot className={`w-3.5 h-3.5 shrink-0 ${tire.iconColor}`} />
                          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                            DESGASTE
                          </span>
                        </div>
                        <div className="h-[18px] flex items-center">
                          <div className="flex items-center gap-1 w-full mt-1">
                            {[1, 2, 3, 4, 5].map((idx) => {
                              const filled = idx <= tire.wearSegments;
                              return (
                                <span
                                  key={idx}
                                  className={`h-1.5 flex-1 rounded-xs ${
                                    filled ? tire.barColor : 'bg-neutral-800'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Section: Futuristic Hex/Chamfered Confirm Button */}
          <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-5 mb-1 sm:mb-2">
            {/* Left floor accent speed ticks */}
            <div className="flex items-center gap-1 opacity-70">
              <span className="w-2.5 h-1.5 -skew-x-[25deg] bg-red-600 block shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              <span className="w-4 h-1.5 -skew-x-[25deg] bg-red-600 block shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            </div>

            {/* Chamfered CTA Button */}
            <button
              onClick={() => {
                playUiClick(700);
                setActiveOverlay('none');
              }}
              onMouseEnter={playUiHover}
              className="relative group cursor-pointer px-8 sm:px-14 py-3 sm:py-3.5 rounded-lg border-2 border-red-500/80 bg-gradient-to-r from-red-950/70 via-red-900/50 to-red-950/70 hover:from-red-600 hover:to-red-700 hover:border-red-400 transition-all duration-300 shadow-[0_0_25px_rgba(239,68,68,0.45)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] flex items-center justify-center gap-3"
            >
              {/* Left bracket decorative element */}
              <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 text-red-500 font-mono text-lg font-bold pointer-events-none select-none">
                〈
              </span>
              {/* Right bracket decorative element */}
              <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 text-red-500 font-mono text-lg font-bold pointer-events-none select-none">
                〉
              </span>

              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-white font-mono group-hover:tracking-[0.18em] transition-all">
                CONFIRMAR NEUMÁTICOS
              </span>
              <ArrowRight className="w-4 h-4 text-red-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            {/* Right floor accent speed ticks */}
            <div className="flex items-center gap-1 opacity-70">
              <span className="w-4 h-1.5 -skew-x-[25deg] bg-red-600 block shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              <span className="w-2.5 h-1.5 -skew-x-[25deg] bg-red-600 block shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY 2: CIRCUIT SELECTION MODAL */}
      {activeOverlay === 'circuit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-neutral-900 border border-white/20 p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white font-mono">
                    SELECCIÓN DE CIRCUITO FIA
                  </h3>
                  <p className="text-[10px] text-neutral-400">Elige el trazado de competición</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playUiClick(700);
                  setActiveOverlay('none');
                }}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AVAILABLE_CIRCUITS.map((c) => {
                const isSelected = selectedCircuit === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCircuitLocal(c.id)}
                    onMouseEnter={playUiHover}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-red-600/25 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white'
                        : 'bg-white/5 border-white/10 hover:border-white/30 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{c.flagEmoji || '🏁'}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-black uppercase tracking-wide">{c.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-1 font-mono">
                        {(c.totalLength / 1000).toFixed(2)} KM · {c.cornersCount} Curvas
                      </div>
                      <div className="text-[9px] text-amber-400 mt-0.5 font-mono">
                        V. Máx: {c.topSpeedKmh} km/h
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                playUiClick(700);
                setActiveOverlay('none');
              }}
              className="w-full mt-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
            >
              CONFIRMAR CIRCUITO
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY 3: LAPS & DISTANCE MODAL */}
      {activeOverlay === 'laps' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/20 p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white font-mono">
                    DURACIÓN DEL GRAN PREMIO
                  </h3>
                  <p className="text-[10px] text-neutral-400">Selecciona el número de vueltas de la carrera</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playUiClick(700);
                  setActiveOverlay('none');
                }}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              {[
                { val: 9 as RaceLapOption, label: '9 VUELTAS', sub: 'Sprint Rápido', desc: 'Carrera corta de alta intensidad sin obligatoriedad de repostaje.' },
                { val: 20 as RaceLapOption, label: '20 VUELTAS', sub: 'Gran Premio Estándar', desc: 'Estrategia completa con gestión de neumáticos y ventana de pit stop.' },
                { val: 50 as RaceLapOption, label: '50 VUELTAS', sub: 'Resistencia Completa', desc: 'Duración oficial FIA. Degradación de neumáticos severa y múltiples paradas.' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    playUiClick(700);
                    setLaps(item.val);
                  }}
                  onMouseEnter={playUiHover}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    laps === item.val
                      ? 'bg-amber-500/25 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-black">{item.label}</div>
                    <div className="text-xs text-amber-300 mt-0.5">{item.sub}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">{item.desc}</div>
                    <div className="text-[10px] text-cyan-300 mt-1">Tiempo estimado: {calculateEstimatedTime(item.val)}</div>
                  </div>
                  {laps === item.val && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 ml-2" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                playUiClick(700);
                setActiveOverlay('none');
              }}
              className="w-full mt-4 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
            >
              CONFIRMAR DURACIÓN
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY 4: AI DIFFICULTY MODAL */}
      {activeOverlay === 'difficulty' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/20 p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Swords className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white font-mono">
                    NIVEL DE COMPETITIVIDAD (IA)
                  </h3>
                  <p className="text-[10px] text-neutral-400">Ajusta la agresividad y ritmo de los pilotos rivales</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playUiClick(700);
                  setActiveOverlay('none');
                }}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              {[
                { id: 'easy' as RaceDifficulty, name: 'NOVATO', desc: 'Ritmo accesible y permisivo. Frenadas anticipadas y trazadas suaves.' },
                { id: 'medium' as RaceDifficulty, name: 'INTERMEDIO', desc: 'Competitivo equilibrado. Ritmo consistente y adelantamientos calculados.' },
                { id: 'hard' as RaceDifficulty, name: 'LEYENDA FIA', desc: 'Máxima agresividad. Frenadas al límite, defensa férrea y ritmo récord.' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => {
                    playUiClick(700);
                    setDifficulty(diff.id);
                  }}
                  onMouseEnter={playUiHover}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    difficulty === diff.id
                      ? 'bg-red-600/25 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-black">{diff.name}</div>
                    <div className="text-[11px] text-neutral-300 mt-1">{diff.desc}</div>
                  </div>
                  {difficulty === diff.id && <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0 ml-2" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                playUiClick(700);
                setActiveOverlay('none');
              }}
              className="w-full mt-4 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
            >
              CONFIRMAR DIFICULTAD
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY 5: LIVERY & DRIVER IDENTITY - IDENTICAL TO REFERENCE DESIGN */}
      {activeOverlay === 'livery' && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex flex-col justify-between p-3 sm:p-5 md:p-6 lg:p-8 animate-in fade-in duration-200 select-none bg-[#05070c]">
          {/* Background: Authentic High-Fidelity Sunset Pitlane & Wet Asphalt Reflections */}
          <img
            src="/assets/aistudio/file_0000000017d882468167dfa6f51ad628_4c32eeea.png"
            alt="Pitlane Sunset"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
          />
          {/* Atmospheric Cinematic Gradients: smooth dark backdrop on UI side, sunset pitlane open on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06080e] via-[#06080e]/95 via-55% to-transparent pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none z-0" />

          {/* Interactive UI Container (Positioned on the Left Exactly as in Reference Image) */}
          <div className="relative z-10 w-full max-w-4xl flex flex-col justify-between h-full min-h-0 py-1">
            
            {/* Top-Left Header: Aerodynamic Dual Slanted Red Winglets + Vertical Divider + Title */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 -skew-x-12 shrink-0">
                <div className="w-2.5 sm:w-3.5 h-6 sm:h-8 bg-gradient-to-b from-red-500 to-red-700 rounded-xs shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
                <div className="w-2.5 sm:w-3.5 h-6 sm:h-8 bg-gradient-to-b from-red-500 to-red-700 rounded-xs shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
              </div>
              <div className="w-[1.5px] h-7 sm:h-8 bg-white/30 shrink-0" />
              <div className="leading-tight min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-white font-sans truncate drop-shadow-md">
                  IDENTIDAD DE PILOTO Y ESCUDERÍA
                </h2>
                <p className="text-[10px] sm:text-xs text-neutral-300 font-sans tracking-wide truncate">
                  Define tu presencia en pista
                </p>
              </div>
            </div>

            {/* Top Row: PILOTO | DORSAL | ESCUDERÍA in Chamfered Beveled Dark Container */}
            <div
              className="relative w-full rounded-2xl bg-[#080a10]/95 backdrop-blur-xl border border-red-500/40 p-2 sm:p-3 shadow-[0_0_25px_rgba(239,68,68,0.25)]"
              style={{
                clipPath: 'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)',
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
                
                {/* Field 1: PILOTO (5 cols) */}
                <div className="sm:col-span-5 flex flex-col">
                  <div className="flex items-center gap-1.5 text-neutral-300 mb-1">
                    <div className="w-4 h-4 rounded-full border border-red-500/80 bg-red-950/60 flex items-center justify-center shrink-0">
                      <User className="w-2.5 h-2.5 text-red-400" />
                    </div>
                    <span className="text-[9.5px] font-mono uppercase tracking-widest text-neutral-300 font-bold">
                      PILOTO
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 bg-black/60 border border-white/10 hover:border-red-500/60 focus-within:border-red-500/80 rounded-xl px-3 py-1.5 transition-colors">
                    <input
                      type="text"
                      value={driverDisplayName}
                      onChange={(e) => setDriverDisplayName(e.target.value)}
                      placeholder="ALEX VEGA"
                      maxLength={20}
                      className="w-full bg-transparent text-white font-black text-xs sm:text-sm uppercase tracking-wider font-sans focus:outline-none placeholder-neutral-500"
                    />
                    <Pencil className="w-3.5 h-3.5 text-neutral-400 shrink-0 opacity-70" />
                  </div>
                </div>

                {/* Field 2: DORSAL (3 cols) */}
                <div className="sm:col-span-3 flex flex-col">
                  <div className="flex items-center gap-1.5 text-neutral-300 mb-1">
                    <div className="w-4 h-4 rounded-xs border border-red-500/80 bg-red-950/60 flex items-center justify-center shrink-0">
                      <Hash className="w-2.5 h-2.5 text-red-400 stroke-[3]" />
                    </div>
                    <span className="text-[9.5px] font-mono uppercase tracking-widest text-neutral-300 font-bold">
                      DORSAL
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 bg-black/60 border border-white/10 rounded-xl px-2 py-1">
                    <button
                      type="button"
                      onClick={() => {
                        playUiClick(700);
                        const num = Math.max(1, (parseInt(carNumber, 10) || 1) - 1);
                        setCarNumber(num.toString());
                      }}
                      className="p-1 hover:text-red-400 text-neutral-300 transition-colors cursor-pointer"
                      title="Dorsal anterior"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <input
                      type="text"
                      value={carNumber}
                      onChange={(e) => setCarNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                      maxLength={2}
                      className="w-10 text-center bg-transparent text-base sm:text-lg font-black text-white font-mono tracking-wider focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        playUiClick(700);
                        const num = Math.min(99, (parseInt(carNumber, 10) || 1) + 1);
                        setCarNumber(num.toString());
                      }}
                      className="p-1 hover:text-red-400 text-neutral-300 transition-colors cursor-pointer"
                      title="Dorsal siguiente"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Field 3: ESCUDERÍA (4 cols) */}
                <div className="sm:col-span-4 flex flex-col">
                  <div className="flex items-center gap-1.5 text-neutral-300 mb-1">
                    <div className="w-4 h-4 rounded-xs border border-red-500/80 bg-red-950/60 flex items-center justify-center shrink-0">
                      <Shield className="w-2.5 h-2.5 text-red-400" />
                    </div>
                    <span className="text-[9.5px] font-mono uppercase tracking-widest text-neutral-300 font-bold">
                      ESCUDERÍA
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 bg-black/60 border border-white/10 hover:border-red-500/60 focus-within:border-red-500/80 rounded-xl px-3 py-1.5 transition-colors">
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="VIOLETA PUNK"
                      maxLength={25}
                      className="w-full bg-transparent text-white font-black text-xs sm:text-sm uppercase tracking-wider font-sans focus:outline-none placeholder-neutral-500 truncate"
                    />
                    <Pencil className="w-3.5 h-3.5 text-neutral-400 shrink-0 opacity-70" />
                    {/* Double Slanted Team Livery Icon Matching Current Selection */}
                    <div className="flex items-center gap-0.5 -skew-x-12 shrink-0 ml-1">
                      <div className="w-2.5 h-5 rounded-xs shadow-sm" style={{ backgroundColor: secondaryColor || primaryColor }} />
                      <div className="w-2.5 h-5 rounded-xs shadow-sm" style={{ backgroundColor: secondaryColor || primaryColor }} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Middle Section: PALETAS DE COLORES DE ESCUDERÍA Panel */}
            <div
              className="relative w-full rounded-2xl bg-[#080a10]/95 backdrop-blur-xl border border-red-500/40 p-2.5 sm:p-3 mt-2 sm:mt-2.5 shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-between"
              style={{
                clipPath: 'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)',
              }}
            >
              <div className="mb-2">
                <span className="text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wider text-white font-sans drop-shadow-sm">
                  PALETAS DE COLORES DE ESCUDERÍA
                </span>
              </div>

              {/* 6 Color Preset Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
                {ESCUDERIA_PALETTES.map((preset) => {
                  const isSelected = selectedPaletteId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        playUiClick(700);
                        setSelectedPaletteId(preset.id);
                        setTeamName(preset.name);
                        setPrimaryColor(preset.primaryColor);
                        setSecondaryColor(preset.secondaryColor);
                        setAccentColor(preset.accentColor);
                        setDriverCode(preset.driverCode);
                      }}
                      className={`group relative rounded-xl p-2 sm:p-2.5 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-between ${
                        isSelected
                          ? 'border-2 border-red-500 bg-[#170e20]/95 shadow-[0_0_20px_rgba(239,68,68,0.7),inset_0_0_10px_rgba(239,68,68,0.25)] scale-[1.02]'
                          : 'border border-white/10 bg-[#0d1017]/85 hover:border-white/30 hover:bg-[#151922]/90'
                      }`}
                    >
                      {/* Checkmark in top-right when selected */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 border border-white flex items-center justify-center shadow-md">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                        </div>
                      )}

                      {/* Double Slanted Colored Bars Icon */}
                      <div className="flex items-center justify-center gap-1.5 -skew-x-12 my-1">
                        <div
                          className="w-3.5 h-6 sm:h-7 rounded-xs shadow-md"
                          style={{ backgroundColor: preset.stripesColor }}
                        />
                        <div
                          className="w-3.5 h-6 sm:h-7 rounded-xs shadow-md"
                          style={{ backgroundColor: preset.stripesColor }}
                        />
                      </div>

                      {/* Palette Title */}
                      <span className="text-[9px] sm:text-[9.5px] font-black uppercase tracking-tight text-white font-sans mt-1 leading-tight truncate w-full">
                        {preset.name}
                      </span>

                      {/* 4 Color Dots */}
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        {preset.dots.map((d, i) => (
                          <div
                            key={i}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/40 shadow-xs shrink-0"
                            style={{ backgroundColor: d }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Studio Banner: ESTUDIO DE DISEÑO Y PATROCINADORES with authentic helmet asset */}
              <button
                type="button"
                onClick={() => {
                  playUiClick(750);
                  setActiveOverlay('none');
                  if (onOpenLiveryStudio) onOpenLiveryStudio();
                }}
                className="group relative w-full mt-2 sm:mt-2.5 py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl bg-black/60 hover:bg-black/85 border border-white/15 hover:border-red-500/70 transition-all cursor-pointer flex items-center justify-center gap-3 shadow-lg overflow-hidden"
              >
                {/* Left Authentic Racing Helmet Graphic */}
                <div className="absolute left-2 sm:left-4 flex items-center pointer-events-none">
                  <img
                    src="/images/livery_studio_helmet.png"
                    alt="Helmet Studio"
                    className="h-7 sm:h-8 md:h-9 object-contain rounded-xs drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]"
                  />
                </div>

                <span className="text-[10.5px] sm:text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white font-sans group-hover:text-red-400 transition-colors drop-shadow-md">
                  ESTUDIO DE DISEÑO Y PATROCINADORES
                </span>
              </button>
            </div>

            {/* Bottom Actions: Centered GUARDAR Y CONFIRMAR + Left VOLVER */}
            <div className="flex flex-col items-center justify-center mt-2.5 sm:mt-3 w-full relative">
              {/* Slanted Hexagon-Cut Ferrari-Red Parallelogram Confirm Button */}
              <button
                type="button"
                onClick={() => {
                  playUiClick(850);
                  saveLivery({
                    driverName: driverDisplayName.trim() || 'ALEX VEGA',
                    driverCode: (driverCode || 'PUN').toUpperCase().slice(0, 3),
                    driverNumber: carNumber || '27',
                    teamName: teamName.trim() || 'VIOLETA PUNK',
                    primaryColor: primaryColor || '#3b0764',
                    secondaryColor: secondaryColor || '#a855f7',
                    accentColor: accentColor || '#f472b6',
                    haloColor: '#0c0f16',
                    sponsorName: (teamName || 'VIOLETA PUNK').toUpperCase(),
                  });
                  setActiveOverlay('none');
                }}
                className="relative px-12 sm:px-18 md:px-24 py-2 sm:py-2.5 bg-gradient-to-r from-red-800 via-red-600 to-red-800 hover:from-red-700 hover:via-red-500 hover:to-red-700 text-white font-black text-xs sm:text-sm tracking-[0.25em] uppercase transition-all duration-200 shadow-[0_0_30px_rgba(239,35,60,0.85)] cursor-pointer active:scale-95 border-t border-b border-red-300"
                style={{
                  clipPath: 'polygon(16px 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 16px 100%, 0 50%)',
                }}
              >
                GUARDAR Y CONFIRMAR
              </button>

              {/* Bottom Left: VOLVER Button */}
              <div className="w-full flex items-center justify-start mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playUiClick(700);
                    setActiveOverlay('none');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-black/80 hover:bg-black border border-white/20 hover:border-red-500 text-white font-black text-[10.5px] sm:text-[11px] tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  style={{
                    clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                  }}
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
                  <span>VOLVER</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* OVERLAY 6: ASSISTS & SETUP MODAL */}
      {activeOverlay === 'setup' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-neutral-900 border border-white/20 p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white font-mono">
                    AYUDAS DE CONDUCCIÓN Y CÁMARA
                  </h3>
                  <p className="text-[10px] text-neutral-400">Calibra las asistencias electrónicas de tu monoplaza</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playUiClick(700);
                  setActiveOverlay('none');
                }}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* TC */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Control de Tracción (TC)</div>
                  <div className="text-[10px] text-neutral-400">Evita el derrape en aceleración saliendo de curvas lentas</div>
                </div>
                <button
                  onClick={() => {
                    playUiClick(700);
                    setTractionControl(!tractionControl);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                    tractionControl ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {tractionControl ? 'ACTIVO' : 'OFF'}
                </button>
              </div>

              {/* ABS */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Sistema Antibloqueo (ABS)</div>
                  <div className="text-[10px] text-neutral-400">Impide que los frenos bloqueen las ruedas en frenadas fuertes</div>
                </div>
                <button
                  onClick={() => {
                    playUiClick(700);
                    setAbsEnabled(!absEnabled);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                    absEnabled ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {absEnabled ? 'ACTIVO' : 'OFF'}
                </button>
              </div>

              {/* Racing Line */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Trazada Dinámica FIA</div>
                  <div className="text-[10px] text-neutral-400">Guía visual de trayectoria y puntos de frenada óptimos</div>
                </div>
                <button
                  onClick={() => {
                    playUiClick(700);
                    setRacingLine(!racingLine);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                    racingLine ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {racingLine ? 'ACTIVO' : 'OFF'}
                </button>
              </div>

              {/* Camera Mode */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-bold text-white mb-2">Perspectiva de Cámara Principal</div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  {[
                    { id: 'chase' as CameraViewMode, name: 'TERCERA' },
                    { id: 'bumper' as CameraViewMode, name: 'MORRO' },
                    { id: 'hood' as CameraViewMode, name: 'CAPÓ' },
                    { id: 'orbit' as CameraViewMode, name: 'ÓRBITA' },
                  ].map((cm) => (
                    <button
                      key={cm.id}
                      onClick={() => {
                        playUiClick(700);
                        setCameraMode(cm.id);
                      }}
                      className={`py-2 rounded-xl border transition-all cursor-pointer font-bold ${
                        cameraMode === cm.id
                          ? 'bg-cyan-500/25 border-cyan-400 text-white'
                          : 'bg-white/5 border-white/10 text-neutral-400'
                      }`}
                    >
                      {cm.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playUiClick(700);
                setActiveOverlay('none');
              }}
              className="w-full mt-4 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
            >
              CONFIRMAR REGLAJES
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY 7: MULTIPLAYER LOBBY MODAL */}
      {activeOverlay === 'multiplayer_modal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/20 p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white font-mono">
                    LOBBY MULTIJUGADOR 1V1
                  </h3>
                  <p className="text-[10px] text-neutral-400">Servidor en tiempo real con WebSocket dedicado</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playUiClick(700);
                  setActiveOverlay('none');
                }}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 mb-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!roomState ? (
              <div className="space-y-4">
                <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 font-mono text-xs">
                  <button
                    onClick={() => setMpTab('create')}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                      mpTab === 'create' ? 'bg-emerald-500 text-black' : 'text-neutral-400'
                    }`}
                  >
                    CREAR SALA
                  </button>
                  <button
                    onClick={() => setMpTab('join')}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                      mpTab === 'join' ? 'bg-emerald-500 text-black' : 'text-neutral-400'
                    }`}
                  >
                    UNIRSE CON CÓDIGO
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase">Tu Alias de Piloto</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={16}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {mpTab === 'create' ? (
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase">Vueltas del Duelo</label>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      {[3, 5, 10].map((v) => (
                        <button
                          key={v}
                          onClick={() => setMpLaps(v)}
                          className={`py-2 rounded-xl border font-bold transition-all ${
                            mpLaps === v
                              ? 'bg-emerald-500/30 border-emerald-400 text-white'
                              : 'bg-white/5 border-white/10 text-neutral-400'
                          }`}
                        >
                          {v} VUELTAS
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase">Código de Sala (4 Letras)</label>
                    <input
                      type="text"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="Ej. ABCD"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-sm font-black font-mono tracking-widest text-center focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                {mpTab === 'create' ? (
                  <button
                    onClick={handleCreateRoomAction}
                    disabled={isConnecting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 font-mono shadow-lg"
                  >
                    {isConnecting ? 'CONECTANDO...' : 'CREAR SALA Y ESPERAR RIVAL'}
                  </button>
                ) : (
                  <button
                    onClick={handleJoinRoomAction}
                    disabled={isConnecting || !joinCodeInput.trim()}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 font-mono shadow-lg"
                  >
                    {isConnecting ? 'CONECTANDO...' : 'UNIRSE A LA SALA'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                {/* Active Room Code Card */}
                <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 text-center">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">Código de Invitación</span>
                  <div className="text-2xl font-black text-emerald-400 tracking-widest mt-1">{roomState.code}</div>
                  <button
                    onClick={copyRoomCode}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isCopied ? '¡COPIADO!' : 'COPIAR CÓDIGO'}</span>
                  </button>
                </div>

                {/* Slot P1 & P2 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[9px] text-neutral-400 block">PILOTO 1 (ANFITRIÓN)</span>
                    <span className="font-bold text-white truncate block">{roomState.players.p1?.name || 'Esperando...'}</span>
                    <span className={`text-[10px] font-bold ${roomState.players.p1?.isReady ? 'text-emerald-400' : 'text-neutral-500'}`}>
                      {roomState.players.p1?.isReady ? '✓ LISTO' : 'NO PREPARADO'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[9px] text-neutral-400 block">PILOTO 2 (RIVAL)</span>
                    <span className="font-bold text-white truncate block">{roomState.players.p2?.name || 'Esperando rival...'}</span>
                    <span className={`text-[10px] font-bold ${roomState.players.p2?.isReady ? 'text-emerald-400' : 'text-neutral-500'}`}>
                      {roomState.players.p2?.isReady ? '✓ LISTO' : 'NO PREPARADO'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleReady}
                    className={`flex-1 py-3 rounded-xl font-bold cursor-pointer transition-colors ${
                      isReady ? 'bg-emerald-500 text-black' : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    {isReady ? '✓ LISTO' : 'MARCAR LISTO'}
                  </button>
                  <button
                    onClick={onLeaveRoom}
                    className="px-4 py-3 rounded-xl bg-red-600/30 border border-red-500/40 text-red-300 hover:bg-red-600/50 font-bold cursor-pointer transition-colors"
                  >
                    SALIR
                  </button>
                </div>

                {playerId === 'p1' && (
                  <button
                    onClick={() => {
                      playUiClick(950);
                      onStartMultiplayerRace();
                    }}
                    disabled={!roomState.players.p1?.isReady || !roomState.players.p2?.isReady}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 disabled:opacity-40 text-black font-black uppercase tracking-wider cursor-pointer shadow-lg"
                  >
                    INICIAR DUELO (AMBOS LISTOS)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OVERLAY 8: CONTROLS GUIDE MODAL */}
      {showControlsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/20 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-black uppercase tracking-wider text-white font-mono">GUÍA DE CONTROLES</h3>
              </div>
              <button
                onClick={() => {
                  playUiClick(700);
                  setShowControlsModal(false);
                }}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Acelerar / Freno</span>
                <span className="font-mono text-amber-400 bg-white/10 px-2 py-0.5 rounded">W / S o Flechas ↑ / ↓</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Girar Dirección</span>
                <span className="font-mono text-amber-400 bg-white/10 px-2 py-0.5 rounded">A / D o Flechas ← / →</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Freno de Mano / Derrape</span>
                <span className="font-mono text-amber-400 bg-white/10 px-2 py-0.5 rounded">Espacio (Space)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Cambiar Cámara</span>
                <span className="font-mono text-cyan-400 bg-white/10 px-2 py-0.5 rounded">Tecla C</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Pausa / Menú de Carrera</span>
                <span className="font-mono text-red-400 bg-white/10 px-2 py-0.5 rounded">Escape (ESC)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Pantalla Completa</span>
                <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">Tecla F</span>
              </div>
            </div>

            <button
              onClick={() => {
                playUiClick(700);
                setShowControlsModal(false);
              }}
              className="w-full mt-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
