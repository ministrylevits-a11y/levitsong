/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Music, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Timer, 
  Mail, 
  User, 
  LogOut, 
  ChevronRight,
  BarChart3,
  BookOpen,
  CircleDot,
  History,
  Menu,
  X,
  Settings,
  Info,
  Home,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Users,
  FileText,
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  Edit3,
  Trash2,
  Check,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { MUSIC_QUESTIONS, THEORY_MODULES, EXERCISES } from './constants';
import { Question, UserAnswer, AssessmentResult, UserProfile, Song, TheoryModule } from './types';
import { cn } from './lib/utils';

// --- Helpers ---

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const transposeChord = (chord: string, amount: number) => {
  return chord.replace(/[A-G][#b]?/g, (match) => {
    let note = match;
    if (note.endsWith('b')) {
      const index = NOTES.indexOf(note[0]);
      note = NOTES[(index - 1 + 12) % 12];
    }
    const index = NOTES.indexOf(note);
    if (index === -1) return match;
    const newIndex = (index + amount + 12) % 12;
    return NOTES[newIndex];
  });
};

const renderSongContent = (content: string, transpose: number) => {
  if (transpose === 0) return content;
  return content.replace(/\[(.*?)\]/g, (_, chord) => {
    return `[${transposeChord(chord, transpose)}]`;
  });
};

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const progress = (current / total) * 100;
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
      <motion.div 
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
    </div>
  );
};

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden",
      className
    )}
    {...props}
  >
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
    {children}
  </motion.div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className,
  type = 'button'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emerald';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50",
    emerald: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    outline: "border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10",
    ghost: "text-white/60 hover:text-white hover:bg-white/5"
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        "px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'home' | 'quiz' | 'results' | 'history' | 'theory' | 'settings' | 'exercises' | 'songs' | 'admin' | 'profile'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Quiz/Exercise State
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizType, setQuizType] = useState<'test' | 'exercise'>('test');

  // Theory State
  const [selectedTheory, setSelectedTheory] = useState<TheoryModule | null>(null);

  // Songs State
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [transpose, setTranspose] = useState(0);
  const [isSubmittingSong, setIsSubmittingSong] = useState(false);

  // Admin State
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allAssessments, setAllAssessments] = useState<AssessmentResult[]>([]);
  const [pendingSongs, setPendingSongs] = useState<Song[]>([]);

  const isAdmin = useMemo(() => user?.email === 'levitstudios@gmail.com', [user]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        let userData: UserProfile;
        
        if (!userDoc.exists()) {
          userData = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || 'Usuario',
            photoURL: u.photoURL || '',
            role: u.email === 'levitstudios@gmail.com' ? 'admin' : 'student',
            createdAt: new Date().toISOString(),
            isVerified: false
          };
          await setDoc(doc(db, 'users', u.uid), userData);
        } else {
          userData = userDoc.data() as UserProfile;
        }
        setProfile(userData);
        fetchHistory(u.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Real-time listeners for Admin and Songs
  useEffect(() => {
    if (!user) return;

    const songsUnsubscribe = onSnapshot(
      query(collection(db, 'songs'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const songsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Song));
        setSongs(songsData.filter(s => s.status === 'approved'));
        if (isAdmin) {
          setPendingSongs(songsData.filter(s => s.status === 'pending'));
        }
      }
    );

    let usersUnsubscribe: () => void = () => {};
    let assessmentsUnsubscribe: () => void = () => {};

    if (isAdmin) {
      usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        setAllUsers(snapshot.docs.map(d => d.data() as UserProfile));
      });
      assessmentsUnsubscribe = onSnapshot(
        query(collection(db, 'assessments'), orderBy('completedAt', 'desc'), limit(50)),
        (snapshot) => {
          setAllAssessments(snapshot.docs.map(d => d.data() as AssessmentResult));
        }
      );
    }

    return () => {
      songsUnsubscribe();
      usersUnsubscribe();
      assessmentsUnsubscribe();
    };
  }, [user, isAdmin]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'quiz' && timeLeft > 0 && !showExplanation) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'quiz') {
      finishQuiz();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, showExplanation]);

  const fetchHistory = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'assessments'),
        where('userId', '==', uid),
        orderBy('completedAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => d.data() as AssessmentResult);
      setHistory(results);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login Error:", err);
    }
  };

  const logout = () => {
    signOut(auth);
    setSidebarOpen(false);
    setGameState('home');
  };

  const ensureAuth = (action: () => void) => {
    if (!user) {
      login();
      return;
    }
    action();
  };

  const startQuiz = () => ensureAuth(() => {
    const shuffled = [...MUSIC_QUESTIONS].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 20));
    setQuizType('test');
    setGameState('quiz');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(Date.now());
    setTimeLeft(600);
    setShowExplanation(false);
    setSidebarOpen(false);
  });

  const startExercise = () => ensureAuth(() => {
    setQuizQuestions([...EXERCISES]);
    setQuizType('exercise');
    setGameState('quiz');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(Date.now());
    setTimeLeft(1800); // 30 mins for exercises
    setShowExplanation(false);
    setSidebarOpen(false);
  });

  const handleAnswer = (optionIndex: number) => {
    const question = quizQuestions[currentQuestionIndex];
    const isCorrect = optionIndex === question.correctOption;
    
    const newAnswer: UserAnswer = {
      questionId: question.id,
      selectedOption: optionIndex,
      isCorrect,
    };

    setUserAnswers([...userAnswers, newAnswer]);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setGameState('results');
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    const score = userAnswers.filter(a => a.isCorrect).length;

    if (user) {
      setIsSaving(true);
      const result: AssessmentResult = {
        userId: user.uid,
        userEmail: user.email || '',
        score,
        totalQuestions: quizQuestions.length,
        topic: quizType === 'test' ? 'Evaluación Final' : 'Práctica de Ejercicios',
        completedAt: new Date().toISOString(),
        timeSpent,
        answers: userAnswers,
      };

      try {
        await addDoc(collection(db, 'assessments'), result);
        fetchHistory(user.uid);
      } catch (err) {
        console.error("Error saving result:", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const NavigationItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
        active 
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
          : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-semibold">{label}</span>
      {active && <motion.div layoutId="active-nav" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Music className="w-12 h-12 text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#0f172a_0%,#020617_100%)]" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-600/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-[#0f172a]/80 backdrop-blur-2xl border-r border-white/5 z-50 p-6 flex flex-col transition-all duration-300 lg:translate-x-0",
          !sidebarOpen && "lg:w-20 lg:p-4"
        )}
      >
        <div className="flex items-center justify-between mb-10">
          <div className={cn("flex items-center gap-3 overflow-hidden", !sidebarOpen && "lg:hidden")}>
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Music className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Harmonía Pro</h1>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavigationItem 
            icon={Home} 
            label="Inicio" 
            active={gameState === 'home'} 
            onClick={() => { setGameState('home'); setSidebarOpen(false); }} 
          />
          <NavigationItem 
            icon={GraduationCap} 
            label="Teoría Musical" 
            active={gameState === 'theory'} 
            onClick={() => { setGameState('theory'); setSelectedTheory(null); setSidebarOpen(false); }} 
          />
          <NavigationItem 
            icon={CircleDot} 
            label="Ejercicios" 
            active={gameState === 'exercises'} 
            onClick={() => ensureAuth(() => { setGameState('exercises'); setSidebarOpen(false); })} 
          />
          <NavigationItem 
            icon={Music} 
            label="Cancionero" 
            active={gameState === 'songs'} 
            onClick={() => ensureAuth(() => { setGameState('songs'); setSidebarOpen(false); })} 
          />
          <NavigationItem 
            icon={History} 
            label="Mi Historial" 
            active={gameState === 'history'} 
            onClick={() => ensureAuth(() => { setGameState('history'); setSidebarOpen(false); })} 
          />
          {isAdmin && (
            <NavigationItem 
              icon={ShieldCheck} 
              label="Admin" 
              active={gameState === 'admin'} 
              onClick={() => ensureAuth(() => { setGameState('admin'); setSidebarOpen(false); })} 
            />
          )}
          <NavigationItem 
            icon={User} 
            label="Mi Perfil" 
            active={gameState === 'profile'} 
            onClick={() => ensureAuth(() => { setGameState('profile'); setSidebarOpen(false); })} 
          />
        </nav>

        {user && (
          <div className={cn("mt-auto pt-6 border-t border-white/5 space-y-4", !sidebarOpen && "lg:hidden")}>
            <div className="flex items-center gap-3 p-2 bg-white/5 rounded-2xl">
              <img src={user.photoURL || ''} className="w-10 h-10 rounded-full" alt="" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.displayName}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </div>
            <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </motion.aside>

      {/* Main Content Area */}
      <main className={cn(
        "relative z-10 transition-all duration-300 min-h-screen flex flex-col",
        sidebarOpen ? "lg:ml-80" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/20 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/5 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <Music className="w-5 h-5 text-emerald-500" />
              <span className="font-bold">Harmonía Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium">{user.displayName}</span>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Estudiante Pro
                  </div>
                </div>
                <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-white/10" alt="" />
              </div>
            ) : (
              <Button onClick={login} variant="emerald" className="py-1.5 px-4 text-xs">
                Ingresar
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
          <AnimatePresence mode="wait">
            {gameState === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest"
                  >
                    <Sparkles className="w-3 h-3" />
                    Plataforma Educativa v2.0
                  </motion.div>
                  <h2 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9]">
                    Explora el <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                      Universo Musical
                    </span>
                  </h2>
                  <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
                    Aprende teoría, practica con evaluaciones dinámicas y lleva un registro detallado de tu progreso académico.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="group cursor-pointer hover:border-emerald-500/30 transition-all" onClick={startQuiz}>
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Evaluación Final</h3>
                    <p className="text-sm text-white/40 mb-6">20 preguntas aleatorias sobre armonía y escalas.</p>
                    <Button variant="emerald" className="w-full">Comenzar Ahora</Button>
                  </Card>

                  <Card className="group cursor-pointer hover:border-teal-500/30 transition-all" onClick={() => setGameState('theory')}>
                    <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-7 h-7 text-teal-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Biblioteca de Teoría</h3>
                    <p className="text-sm text-white/40 mb-6">Repasa los conceptos clave antes de tu examen.</p>
                    <Button variant="secondary" className="w-full">Explorar Temas</Button>
                  </Card>

                  <Card className="group cursor-pointer hover:border-cyan-500/30 transition-all" onClick={() => ensureAuth(() => setGameState('history'))}>
                    <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-7 h-7 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Estadísticas</h3>
                    <p className="text-sm text-white/40 mb-6">Analiza tu desempeño y áreas de mejora.</p>
                    <Button variant="secondary" className="w-full">Ver Reporte</Button>
                  </Card>
                </div>
              </motion.div>
            )}

            {gameState === 'quiz' && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      Pregunta {currentQuestionIndex + 1} de {quizQuestions.length}
                    </p>
                    <h3 className="text-xl font-bold text-white/60">
                      {quizQuestions[currentQuestionIndex].topic}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                    <Timer className={cn("w-5 h-5", timeLeft < 60 ? "text-red-400 animate-pulse" : "text-emerald-400")} />
                    <span className={cn("font-mono font-bold", timeLeft < 60 ? "text-red-400" : "text-white")}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                <ProgressBar current={currentQuestionIndex + 1} total={quizQuestions.length} />

                <Card className="p-10">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-10 leading-snug">
                    {quizQuestions[currentQuestionIndex].text}
                  </h2>

                  <div className="grid grid-cols-1 gap-4">
                    {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                      const isSelected = userAnswers[currentQuestionIndex]?.selectedOption === idx;
                      const isCorrect = idx === quizQuestions[currentQuestionIndex].correctOption;
                      const hasAnswered = userAnswers.length > currentQuestionIndex;

                      return (
                        <motion.button
                          key={idx}
                          disabled={hasAnswered}
                          onClick={() => handleAnswer(idx)}
                          whileHover={!hasAnswered ? { x: 10 } : {}}
                          className={cn(
                            "group relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                            !hasAnswered 
                              ? "border-white/5 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5" 
                              : isCorrect 
                                ? "border-emerald-500/50 bg-emerald-500/10" 
                                : isSelected 
                                  ? "border-red-500/50 bg-red-500/10" 
                                  : "border-white/5 bg-white/5 opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors",
                              !hasAnswered 
                                ? "bg-white/10 group-hover:bg-emerald-500 text-white" 
                                : isCorrect 
                                  ? "bg-emerald-500 text-white" 
                                  : isSelected 
                                    ? "bg-red-500 text-white" 
                                    : "bg-white/10 text-white/40"
                            )}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="font-medium text-lg">{option}</span>
                          </div>
                          
                          {hasAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                          {hasAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-8 pt-8 border-t border-white/10 space-y-4"
                      >
                        <div className={cn(
                          "p-4 rounded-xl flex gap-3",
                          userAnswers[currentQuestionIndex].isCorrect ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        )}>
                          <Info className="w-5 h-5 shrink-0" />
                          <p className="text-sm leading-relaxed">
                            <span className="font-bold block mb-1">
                              {userAnswers[currentQuestionIndex].isCorrect ? "¡Correcto!" : "Respuesta Incorrecta"}
                            </span>
                            {quizQuestions[currentQuestionIndex].explanation}
                          </p>
                        </div>
                        <Button onClick={nextQuestion} className="w-full">
                          {currentQuestionIndex === quizQuestions.length - 1 ? "Finalizar Test" : "Siguiente Pregunta"}
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )}

            {gameState === 'results' && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center"
              >
                <Card className="py-16">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20"
                  >
                    <Trophy className="w-12 h-12 text-white" />
                  </motion.div>

                  <h2 className="text-4xl font-black mb-2">¡Evaluación Completada!</h2>
                  <p className="text-white/40 mb-12">Has finalizado el test de Harmonía Pro</p>

                  <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto mb-12">
                    <div className="space-y-1">
                      <p className="text-5xl font-black text-emerald-400">
                        {userAnswers.filter(a => a.isCorrect).length}
                      </p>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Aciertos</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-5xl font-black text-teal-400">
                        {Math.round((userAnswers.filter(a => a.isCorrect).length / quizQuestions.length) * 100)}%
                      </p>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Puntaje</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between max-w-md mx-auto">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-emerald-400" />
                        <div className="text-left">
                          <p className="text-xs text-white/40 font-bold uppercase">Notificación Enviada</p>
                          <p className="text-sm font-medium">{user?.email}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                        ENVIADO
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button onClick={startQuiz} className="w-full sm:w-auto px-12">
                    Intentar de nuevo
                  </Button>
                  <Button onClick={() => setGameState('home')} variant="secondary" className="w-full sm:w-auto px-12">
                    Volver al inicio
                  </Button>
                </div>
              </motion.div>
            )}

            {gameState === 'theory' && (
              <motion.div 
                key="theory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black">Biblioteca de Teoría</h2>
                  {selectedTheory && (
                    <Button onClick={() => setSelectedTheory(null)} variant="ghost">Volver</Button>
                  )}
                </div>

                {!selectedTheory ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {THEORY_MODULES.map((module) => (
                      <Card key={module.id} className="p-8 group">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                        <p className="text-white/40 text-sm mb-6">{module.description}</p>
                        <Button onClick={() => setSelectedTheory(module)} variant="emerald" className="w-full">
                          Estudiar Ahora
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-10 prose prose-invert max-w-none">
                    <ReactMarkdown>{selectedTheory.content}</ReactMarkdown>
                  </Card>
                )}
              </motion.div>
            )}

            {gameState === 'exercises' && (
              <motion.div 
                key="exercises"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black">Ejercicios Prácticos</h2>
                </div>
                <Card className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-teal-500/10 rounded-3xl flex items-center justify-center mx-auto text-teal-400">
                    <CircleDot className="w-10 h-10" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-2xl font-bold">Sesión de Práctica</h3>
                    <p className="text-white/40">Resuelve ejercicios específicos para reforzar tus conocimientos. Estas sesiones no afectan tu promedio final pero te ayudan a mejorar.</p>
                  </div>
                  <Button onClick={startExercise} variant="emerald" className="px-12 mx-auto">
                    Empezar Práctica
                  </Button>
                </Card>
              </motion.div>
            )}

            {gameState === 'songs' && (
              <motion.div 
                key="songs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black">Cancionero</h2>
                  {selectedSong ? (
                    <Button onClick={() => setSelectedSong(null)} variant="ghost">Volver</Button>
                  ) : (
                    <Button onClick={() => setIsSubmittingSong(true)} variant="emerald">
                      <Plus className="w-5 h-5" />
                      Sugerir Canción
                    </Button>
                  )}
                </div>

                {!selectedSong ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {songs.map((song) => (
                      <Card key={song.id} className="p-6 group cursor-pointer" onClick={() => setSelectedSong(song)}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Music className="w-6 h-6" />
                          </div>
                          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-white/40">
                            Tono: {song.originalKey}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">{song.title}</h3>
                        <p className="text-white/40 text-sm">{song.artist}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Card className="p-8">
                      <div className="flex flex-wrap items-center justify-between gap-6 mb-10 border-b border-white/10 pb-8">
                        <div>
                          <h3 className="text-3xl font-black">{selectedSong.title}</h3>
                          <p className="text-white/40">{selectedSong.artist}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                          <span className="text-xs font-bold uppercase tracking-widest px-2">Transportar</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setTranspose(prev => prev - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-emerald-400">{transpose > 0 ? `+${transpose}` : transpose}</span>
                            <button 
                              onClick={() => setTranspose(prev => prev + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <pre className="font-mono text-lg leading-relaxed whitespace-pre-wrap text-white/80">
                        {renderSongContent(selectedSong.content, transpose)}
                      </pre>
                    </Card>
                  </div>
                )}
              </motion.div>
            )}

            {gameState === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black">Mi Historial</h2>
                </div>

                <div className="space-y-4">
                  {history.length > 0 ? history.map((res, i) => (
                    <Card key={i} className="p-6 flex items-center justify-between hover:bg-white/10 transition-colors cursor-default">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex flex-col items-center justify-center border border-emerald-500/20">
                          <span className="text-2xl font-black text-emerald-400">{res.score}</span>
                          <span className="text-[10px] font-bold text-white/40 uppercase">/{res.totalQuestions}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{res.topic}</h3>
                          <p className="text-sm text-white/40">
                            {new Date(res.completedAt).toLocaleDateString()} • {Math.floor(res.timeSpent / 60)}m {res.timeSpent % 60}s
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        {Math.round((res.score / res.totalQuestions) * 100)}%
                        <ChevronRight className="w-5 h-5 opacity-20" />
                      </div>
                    </Card>
                  )) : (
                    <div className="text-center py-20 text-white/20">
                      No hay intentos registrados aún.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {gameState === 'admin' && isAdmin && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-black">Panel de Administración</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        Gestión de Usuarios
                      </h3>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                        <input placeholder="Buscar..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/5">
                            <th className="pb-4">Usuario</th>
                            <th className="pb-4">Rol</th>
                            <th className="pb-4">Estado</th>
                            <th className="pb-4">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {allUsers.map((u) => (
                            <tr key={u.uid} className="border-b border-white/5">
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <img src={u.photoURL} className="w-8 h-8 rounded-full" alt="" />
                                  <div>
                                    <p className="font-bold">{u.displayName}</p>
                                    <p className="text-xs text-white/40">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={cn(
                                  "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                                  u.role === 'admin' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/40"
                                )}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-4">
                                {u.isVerified ? (
                                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Clock className="w-4 h-4 text-white/20" />
                                )}
                              </td>
                              <td className="py-4">
                                <Button variant="ghost" className="p-2">
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <Card className="p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Music className="w-5 h-5 text-teal-400" />
                      Aprobaciones ({pendingSongs.length})
                    </h3>
                    <div className="space-y-4">
                      {pendingSongs.map((s) => (
                        <div key={s.id} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                          <div>
                            <p className="font-bold text-sm">{s.title}</p>
                            <p className="text-xs text-white/40">Por: {s.authorEmail}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={async () => {
                                await updateDoc(doc(db, 'songs', s.id), { status: 'approved' });
                              }}
                              variant="emerald" 
                              className="flex-1 py-1.5 text-xs"
                            >
                              Aprobar
                            </Button>
                            <Button 
                              onClick={async () => {
                                await deleteDoc(doc(db, 'songs', s.id));
                              }}
                              variant="secondary" 
                              className="flex-1 py-1.5 text-xs text-red-400"
                            >
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingSongs.length === 0 && (
                        <p className="text-center py-10 text-white/20 text-sm">No hay canciones pendientes.</p>
                      )}
                    </div>
                  </Card>
                </div>

                <Card className="p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    Historial de Calificaciones Recientes
                  </h3>
                  <div className="space-y-4">
                    {allAssessments.map((res, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center font-bold text-emerald-400">
                            {res.score}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{res.userEmail}</p>
                            <p className="text-xs text-white/40">{res.topic} • {new Date(res.completedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">{Math.round((res.score / res.totalQuestions) * 100)}%</p>
                          <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{Math.floor(res.timeSpent / 60)}m {res.timeSpent % 60}s</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {gameState === 'profile' && profile && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black">Mi Perfil</h2>
                </div>
                
                <Card className="p-10">
                  <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                    <div className="relative">
                      <img src={profile.photoURL} className="w-32 h-32 rounded-3xl border-4 border-emerald-500/20 shadow-2xl" alt="" />
                      {profile.isVerified && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="text-center sm:text-left space-y-2">
                      <h3 className="text-3xl font-black">{profile.displayName}</h3>
                      <p className="text-white/40 font-medium">{profile.email}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-widest">
                          {profile.role}
                        </span>
                        <span className="px-3 py-1 bg-white/5 text-white/40 rounded-lg text-xs font-bold uppercase tracking-widest">
                          {profile.instrument || 'Sin instrumento'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-white/10">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Biografía</p>
                      <p className="text-sm">{profile.bio || 'Sin biografía.'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Teléfono</p>
                      <p className="text-sm">{profile.phone || 'No registrado'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Miembro desde</p>
                      <p className="text-sm">{new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Verificación</p>
                      <p className={cn("text-sm font-bold", profile.isVerified ? "text-emerald-400" : "text-amber-400")}>
                        {profile.isVerified ? "Cuenta Verificada" : "Pendiente de Verificación"}
                      </p>
                    </div>
                  </div>

                  <Button className="mt-10 w-full" variant="secondary">
                    Editar Información Personal
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="py-12 text-center border-t border-white/5 mt-auto">
          <p className="text-white/20 text-sm">
            &copy; 2026 Harmonía Pro. Desarrollado para educación musical avanzada.
          </p>
        </footer>
      </main>
      {/* Song Submission Modal */}
      <AnimatePresence>
        {isSubmittingSong && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubmittingSong(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Sugerir Nueva Canción</h3>
                <button onClick={() => setIsSubmittingSong(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newSong = {
                  title: formData.get('title') as string,
                  artist: formData.get('artist') as string,
                  originalKey: formData.get('key') as string,
                  content: formData.get('content') as string,
                  authorId: user?.uid,
                  authorEmail: user?.email,
                  status: 'pending',
                  createdAt: new Date().toISOString()
                };
                await addDoc(collection(db, 'songs'), newSong);
                setIsSubmittingSong(false);
              }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">Título</label>
                    <input name="title" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">Artista</label>
                    <input name="artist" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Tonalidad Original (Ej: C, G, Am)</label>
                  <input name="key" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Contenido (Letra con acordes en [ ])</label>
                  <textarea name="content" required rows={10} placeholder="[C]Hoy es un [G]gran día..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 font-mono text-sm" />
                </div>
                <Button type="submit" variant="emerald" className="w-full py-4">Enviar para Revisión</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
