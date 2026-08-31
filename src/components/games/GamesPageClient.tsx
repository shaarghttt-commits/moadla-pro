'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Swords,
  Brain,
  Zap,
  Trophy,
  Users,
  Play,
  Flame,
  Sparkles,
  Crown,
  Gauge,
  HelpCircle,
  RotateCcw,
  Gift,
  Search,
  CheckCircle2,
  BookOpen,
  Layers,
  Globe,
  Boxes,
  UserPlus,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import EquationDuelRoom from './EquationDuelRoom';
import MemoryMatchGame from './MemoryMatchGame';
import SpeedMathGame from './SpeedMathGame';
import GameLeaderboardTab from './GameLeaderboardTab';
import EngineeringMillionaireGame from './EngineeringMillionaireGame';
import FormulaMathRacerGame from './FormulaMathRacerGame';
import LuckySpinWheelGame from './LuckySpinWheelGame';
import SpotTheMathTrapGame from './SpotTheMathTrapGame';
import MathTicTacToeGame from './MathTicTacToeGame';
import MathTugOfWarGame from './MathTugOfWarGame';
import CalculusBlasterGame from './CalculusBlasterGame';
import PhysicsCircuitGame from './PhysicsCircuitGame';
import MechanicsTorqueGame from './MechanicsTorqueGame';
import AlgebraVectorGame from './AlgebraVectorGame';
import ChessMasterGame from './ChessMasterGame';
import GameInviteModal from './GameInviteModal';

export default function GamesPageClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const challengeStudentId = searchParams?.get('challenge');
  const roomParam = searchParams?.get('room');
  const gameParam = searchParams?.get('game');

  const [activeGame, setActiveGame] = useState<
    | 'hub'
    | 'chess'
    | 'duel'
    | 'tictactoe'
    | 'tugofwar'
    | 'calculus_blaster'
    | 'physics_circuit'
    | 'mechanics_torque'
    | 'algebra_vector'
    | 'memory'
    | 'speed_math'
    | 'millionaire'
    | 'racer'
    | 'spin_wheel'
    | 'math_trap'
    | 'leaderboard'
  >('hub');
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(challengeStudentId || null);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | undefined>(roomParam || undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteDefaultGame, setInviteDefaultGame] = useState('chess');

  useEffect(() => {
    if (roomParam && gameParam) {
      setCurrentRoomCode(roomParam);
      if (['chess', 'duel', 'tictactoe', 'tugofwar'].includes(gameParam.toLowerCase())) {
        setActiveGame(gameParam.toLowerCase() as any);
      }
    } else if (challengeStudentId) {
      setSelectedOpponentId(challengeStudentId);
      setIsInviteModalOpen(true);
    }
  }, [roomParam, gameParam, challengeStudentId]);

  const openInviteForGame = (gameId: string) => {
    setInviteDefaultGame(gameId);
    setIsInviteModalOpen(true);
  };

  const handleStartInvitedGame = (gameType: string, roomCode: string) => {
    setCurrentRoomCode(roomCode);
    setActiveGame(gameType as any);
  };

  // Render active game arenas
  if (activeGame === 'chess') {
    return (
      <ChessMasterGame
        roomCode={currentRoomCode}
        opponentId={selectedOpponentId}
        onExit={() => setActiveGame('hub')}
      />
    );
  }

  if (activeGame === 'calculus_blaster') {
    return <CalculusBlasterGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'physics_circuit') {
    return <PhysicsCircuitGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'mechanics_torque') {
    return <MechanicsTorqueGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'algebra_vector') {
    return <AlgebraVectorGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'tictactoe') {
    return <MathTicTacToeGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'tugofwar') {
    return <MathTugOfWarGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'millionaire') {
    return <EngineeringMillionaireGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'racer') {
    return <FormulaMathRacerGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'spin_wheel') {
    return <LuckySpinWheelGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'math_trap') {
    return <SpotTheMathTrapGame onExit={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'duel') {
    return (
      <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <EquationDuelRoom
          roomCode={currentRoomCode}
          opponentId={selectedOpponentId}
          onExit={() => setActiveGame('hub')}
        />
      </div>
    );
  }

  if (activeGame === 'memory') {
    return (
      <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <MemoryMatchGame onExit={() => setActiveGame('hub')} />
      </div>
    );
  }

  if (activeGame === 'speed_math') {
    return (
      <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SpeedMathGame onExit={() => setActiveGame('hub')} />
      </div>
    );
  }

  const GAMES_CATALOG = [
    // ♟️ لعبة الشطرنج الاحترافية
    {
      id: 'chess',
      category: 'multiplayer',
      title: 'الشطرنج التنافسي الاحترافي ♟️👑',
      subtitle: 'مبارزة شطرنج بقواعد رسمية كاملة، تدعم اللعب مع الأصدقاء بالدعوة أو تحدي الذكاء الاصطناعي مع مكافآت أسئلة المعادلة التكتيكية!',
      badge: 'جديد ومميز ♟️',
      gradient: 'from-amber-700 via-amber-950 to-slate-950',
      icon: '♟️',
      tag: 'شطرنج وذكاء استراتيجي',
      is1v1: true,
      action: () => setActiveGame('chess'),
    },

    // 📐 مادة التفاضل والتكامل
    {
      id: 'calculus_blaster',
      category: 'calculus',
      title: 'صائد التفاضل والتكامل النيون 📐⚡',
      subtitle: 'معركة ليزر نيون ضد وحوش وزعماء الاشتقاق والتكامل والنهايات مع ضربات كومبو خارقة!',
      badge: 'جرافيك نيون 3D ⚡',
      gradient: 'from-cyan-600 via-blue-900 to-slate-950',
      icon: '📐',
      tag: 'مادة التفاضل والتكامل',
      action: () => setActiveGame('calculus_blaster'),
    },
    {
      id: 'racer',
      category: 'calculus',
      title: 'سباق سيارات التفاضل 🏎️',
      subtitle: 'سباق سرعة حماسي؛ كلما حللت مسائل الاشتقاق والتكامل أسرع، زادت سرعة سيارتك وتفعل النيترو!',
      badge: 'سباق وسرعة 🏁',
      gradient: 'from-rose-600 via-purple-900 to-slate-950',
      icon: '🏎️',
      tag: 'مادة التفاضل والتكامل',
      action: () => setActiveGame('racer'),
    },

    // ⚡ مادة الفيزياء الكهربية والمغناطيسية
    {
      id: 'physics_circuit',
      category: 'physics',
      title: 'مهندس الدوائر الكهربية وقانون كيرشوف ⚡💡',
      subtitle: 'احسب المقاومات والتيارات لتوصيل محطات الشبكة القومية وإنارة المدينة بدون حدوث قفلة كهربية!',
      badge: 'محاكاة فيزيائية 💡',
      gradient: 'from-amber-600 via-orange-950 to-slate-950',
      icon: '⚡',
      tag: 'مادة الفيزياء',
      action: () => setActiveGame('physics_circuit'),
    },

    // ⚙️ مادة الميكانيكا والاستاتيكا والديناميكا
    {
      id: 'mechanics_torque',
      category: 'mechanics',
      title: 'تحدي العزوم والاتزان الهندسي ⚙️🏗️',
      subtitle: 'موازنة عتلات وروافع القوى وحساب ردود الأفعال والاحتكاك السكوني لمنع انهيار الرافعة!',
      badge: 'اتزان واستاتيكا 🏗️',
      gradient: 'from-purple-600 via-indigo-950 to-slate-950',
      icon: '⚙️',
      tag: 'مادة الميكانيكا',
      action: () => setActiveGame('mechanics_torque'),
    },

    // 🔢 مادة الجبر والهندسة الفراغية
    {
      id: 'algebra_vector',
      category: 'algebra',
      title: 'حرب المتجهات ثلاثية الأبعاد 🔢🚀',
      subtitle: 'معركة تصويب فضائية في الفضاء (X, Y, Z) باستخدام الضرب القياسي لتفجير كويكبات المصفوفات!',
      badge: 'فضاء 3D 🪐',
      gradient: 'from-emerald-600 via-teal-950 to-slate-950',
      icon: '🔢',
      tag: 'مادة الجبر والفراغية',
      action: () => setActiveGame('algebra_vector'),
    },

    // 👥 ألعاب ثنائية 1v1
    {
      id: 'tictactoe',
      category: 'multiplayer',
      title: 'تيك تاك تو المعادلات X-O 1v1 ❌⭕',
      subtitle: 'مبارزة ثنائية حماسية بين طالبين؛ حل المسألة الرياضية في المربع للاستيلاء عليه وتحقيق الفوز!',
      badge: 'ثنائي 1v1 👥',
      gradient: 'from-blue-600 via-indigo-900 to-slate-950',
      icon: '❌⭕',
      tag: 'تحديات لاعب ضد لاعب',
      is1v1: true,
      action: () => setActiveGame('tictactoe'),
    },
    {
      id: 'tugofwar',
      category: 'multiplayer',
      title: 'معركة شد الحبل الرياضي 🪢',
      subtitle: 'تحدي سرعة وتركيز بين طالبين؛ اسحب الحبل لجهتك مع كل مسألة تجيب عليها بشكل أسرع من الخصم!',
      badge: 'ثنائي 1v1 👥',
      gradient: 'from-amber-600 via-rose-900 to-slate-950',
      icon: '🪢',
      tag: 'تحديات لاعب ضد لاعب',
      is1v1: true,
      action: () => setActiveGame('tugofwar'),
    },
    {
      id: 'duel',
      category: 'multiplayer',
      title: 'غرفة مبارزة المعادلات الحية ⚔️',
      subtitle: 'تحدَّ زملاءك في مبارزات رياضية 1v1 مباشرة مع نظام نقاط وسرعة وشات تفاعلي داخل الغرفة!',
      badge: 'ثنائي 1v1 👥',
      gradient: 'from-indigo-600 via-purple-900 to-slate-950',
      icon: '⚔️',
      tag: 'تحديات لاعب ضد لاعب',
      is1v1: true,
      action: () => setActiveGame('duel'),
    },

    // 🏆 تحديات عامة وجوائز
    {
      id: 'millionaire',
      category: 'general',
      title: 'من سيربح المليون الهندسي 💰',
      subtitle: '15 سؤالاً متدرج الصعوبة للوصول إلى جائزة المليون نقطة مع وسائل المساعدة الشهيرة!',
      badge: 'الأكثر شعبية 🔥',
      gradient: 'from-amber-600 via-indigo-900 to-slate-950',
      icon: '👑',
      tag: 'تحدي المعرفة الشامل',
      action: () => setActiveGame('millionaire'),
    },
    {
      id: 'spin_wheel',
      category: 'general',
      title: 'عجلة الحظ والجوائز اليومية 🎡',
      subtitle: 'لفة مجانية يومية لكل طالب لكسب نقاط XP إضافية، دروع حماية الشعلة، وأوسمة نادرة!',
      badge: 'يومي 🎁',
      gradient: 'from-emerald-600 via-teal-900 to-slate-950',
      icon: '🎁',
      tag: 'جوائز وهدايا فورية',
      action: () => setActiveGame('spin_wheel'),
    },
    {
      id: 'math_trap',
      category: 'general',
      title: 'صائد الفخاخ والأخطاء الرياضية 🕵️‍♂️',
      subtitle: 'اكتشف الخطوة الخبيثة الخاطئة في خطوات حل المسائل قبل انتهاء الوقت لتطوير قوة الملاحظة!',
      badge: 'تدريب بابل شيت 💡',
      gradient: 'from-cyan-600 via-indigo-900 to-slate-950',
      icon: '🔍',
      tag: 'كشف الأخطاء الخفية',
      action: () => setActiveGame('math_trap'),
    },
    {
      id: 'memory',
      category: 'general',
      title: 'مطابقة بطاقات الذاكرة والقوانين 🧠',
      subtitle: 'اختبر قوة ذاكرتك بمطابقة القوانين الرياضية مع رموزها ونظرياتها في أقل وقت ممكن.',
      badge: 'تنشيط الذاكرة 🧩',
      gradient: 'from-purple-600 via-slate-900 to-black',
      icon: '🧠',
      tag: 'تثبيت القوانين في الذاكرة',
      action: () => setActiveGame('memory'),
    },
    {
      id: 'speed_math',
      category: 'general',
      title: 'سرعة العمليات الحسابية ⚡',
      subtitle: 'أجب على أكبر عدد من العمليات والمسائل الرياضية السريعة خلال 60 ثانية متواصلة!',
      badge: 'سرعة فائقة ⏱️',
      gradient: 'from-amber-600 via-blue-900 to-slate-950',
      icon: '⚡',
      tag: 'حساب ذهني سريع',
      action: () => setActiveGame('speed_math'),
    },
  ];

  const CATEGORIES = [
    { id: 'all', label: 'جميع الألعاب 🎮', count: GAMES_CATALOG.length },
    { id: 'multiplayer', label: '👥 ألعاب ثنائية بالدعوة 1v1', count: 4 },
    { id: 'calculus', label: '📐 التفاضل والتكامل', count: 2 },
    { id: 'physics', label: '⚡ الفيزياء', count: 1 },
    { id: 'mechanics', label: '⚙️ الميكانيكا', count: 1 },
    { id: 'algebra', label: '🔢 الجبر والفراغية', count: 1 },
    { id: 'general', label: '🏆 تحديات وجوائز', count: 5 },
  ];

  const filteredGames = selectedCategory === 'all'
    ? GAMES_CATALOG
    : GAMES_CATALOG.filter((g) => g.category === selectedCategory);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in font-tajawal">
      {/* 1. Hero Banner */}
      <div className="relative rounded-[36px] bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute -left-12 -bottom-12 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-black backdrop-blur-md border border-cyan-400/30">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>ألعاب تعليمية ثنائية بالدعوة وشطرنج احترافي 🎮♟️</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-tajawal leading-tight">
              ألعاب ومبارزات بأسئلة امتحانات المعادلة ونظام دعوة الأصدقاء
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تحدَّ أصدقاءك في مباريات شطرنج احترافية، مبارزات 1v1 بالدعوة، وألعاب تصويب وألغاز هندسية تستورد أسئلتها مباشرة من امتحانات السنين السابقة!
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setInviteDefaultGame('chess');
                setIsInviteModalOpen(true);
              }}
              className="px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition hover:scale-105 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>دعوة صديق للعب 1v1 📲</span>
            </button>
            <Link
              href="/exams/simulator"
              className="px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg transition hover:scale-105"
            >
              امتحانات البابل شيت 📋
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Subject Category Selector Bar */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-tajawal">
            ألعاب المواد والتحديات التنافسية
          </h2>

          <span className="text-xs font-bold text-slate-400 font-mono">
            {filteredGames.length} ألعاب متوفرة ⚡
          </span>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-[10px]">
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-soft hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} text-white flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    {game.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black border border-slate-200 dark:border-slate-700">
                    {game.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 block mb-1">
                    {game.tag}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {game.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={game.action}
                  className="flex-1 py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition hover:scale-102 active:scale-95"
                >
                  <Play className="w-4 h-4" />
                  <span>العب الآن 🎮</span>
                </button>

                {game.is1v1 && (
                  <button
                    type="button"
                    onClick={() => openInviteForGame(game.id)}
                    className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-slate-950 font-black text-xs border border-amber-500/30 transition hover:scale-105"
                    title="دعوة صديق للعب"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friend Invite Modal */}
      <GameInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        defaultGameType={inviteDefaultGame}
        onStartGame={handleStartInvitedGame}
      />
    </div>
  );
}
