import React, { useState, useEffect } from 'react';

// Import Lexend font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const CycleApp = () => {
  const [userData, setUserData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentView, setCurrentView] = useState('today'); // 'today', 'cycle', 'log', 'me'
  const [onboardingData, setOnboardingData] = useState({
    lastPeriodStart: '',
    lastPeriodEnd: '',
    averageCycleLength: 28,
    averagePeriodLength: 5,
    isIrregular: false
  });
  const [todayLog, setTodayLog] = useState({
    sleep: '',
    mood: '',
    energy: '',
    stress: '',
    workout: { type: '', intensity: '', notes: '' },
    fasting: '',
    notes: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cycleAppData');
    if (stored) {
      setUserData(JSON.parse(stored));
    }
  }, []);

  // Save data to localStorage whenever it changes
  const saveUserData = (data) => {
    localStorage.setItem('cycleAppData', JSON.stringify(data));
    setUserData(data);
  };

  // Complete onboarding
  const completeOnboarding = () => {
    const newUserData = {
      profile: {
        ...onboardingData,
        createdAt: new Date().toISOString()
      },
      dailyLogs: {},
      periodHistory: [{
        start: onboardingData.lastPeriodStart,
        end: onboardingData.lastPeriodEnd,
        cycleLength: null
      }],
      personalPatterns: {
        cyclesLogged: 0,
        lastCalculated: null,
        sleepNeeds: {},
        energyTrends: {},
        workoutTolerance: {}
      }
    };
    saveUserData(newUserData);
  };

  // Calculate current cycle phase
  const calculatePhase = () => {
    if (!userData?.profile?.lastPeriodStart) return null;
    
    const today = new Date();
    const periodStart = new Date(userData.profile.lastPeriodStart);
    const daysSincePeriod = Math.floor((today - periodStart) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysSincePeriod % userData.profile.averageCycleLength) + 1;
    
    let phase, phaseDay, phaseColor;
    
    if (cycleDay <= userData.profile.averagePeriodLength) {
      phase = 'Menstrual';
      phaseDay = cycleDay;
      phaseColor = 'from-indigo-800 to-purple-900';
    } else if (cycleDay <= 13) {
      phase = 'Follicular';
      phaseDay = cycleDay - userData.profile.averagePeriodLength;
      phaseColor = 'from-indigo-600 to-purple-700';
    } else if (cycleDay <= 16) {
      phase = 'Ovulatory';
      phaseDay = cycleDay - 13;
      phaseColor = 'from-orange-500 to-orange-700';
    } else {
      phase = 'Luteal';
      phaseDay = cycleDay - 16;
      phaseColor = 'from-purple-700 to-indigo-800';
    }
    
    return { phase, cycleDay, phaseDay, phaseColor };
  };

  // Get guidance based on phase and daily inputs
  const getGuidance = (phase, todayInputs = null) => {
    const baseGuidance = {
      'Menstrual': {
        training: {
          message: 'Gentle movement, yoga, or walks. Honor your body\'s need for rest.',
          science: 'During menstruation, progesterone and estrogen are at their lowest. Energy levels naturally dip, and your body is focused on shedding the uterine lining.',
          suggestions: ['Restorative yoga', 'Walking', 'Gentle stretching', 'Rest days']
        },
        nutrition: {
          message: 'Iron-rich foods and anti-inflammatory meals. Warming soups and stews.',
          science: 'You\'re losing iron through menstruation. Anti-inflammatory foods help reduce prostaglandins that cause cramping.',
          suggestions: ['Leafy greens', 'Red meat or lentils', 'Ginger tea', 'Turmeric', 'Bone broth']
        },
        energy: {
          message: 'Rest is productive. Low social energy is natural - honour inward time.',
          science: 'Low hormone levels can affect mood and energy. This is a natural time for introspection and rest.',
          suggestions: ['Journal', 'Light social activities', 'Early bedtime', 'Solo time']
        },
        fasting: {
          message: 'Shorter fasting windows (12-14h) or skip altogether. Nourishment first.',
          science: 'Your body needs consistent fuel during menstruation. Fasting can add stress when energy is already low.',
          suggestions: ['12-14 hour fasting', 'Eat when hungry', 'Focus on nourishment']
        }
      },
      'Follicular': {
        training: {
          message: 'Perfect time for strength training and HIIT. Your body is primed for power!',
          science: 'Rising estrogen improves insulin sensitivity, muscle protein synthesis, and pain tolerance. You recover faster and build strength more efficiently.',
          suggestions: ['Heavy lifting', 'HIIT', 'Plyometrics', 'New PRs', 'Intense cardio']
        },
        nutrition: {
          message: 'Higher carbs with lean protein. Fresh, light meals support rising energy.',
          science: 'Estrogen enhances carbohydrate metabolism. Your body efficiently uses carbs for energy and muscle building.',
          suggestions: ['Quinoa', 'Sweet potatoes', 'Chicken breast', 'Fresh vegetables', 'Smoothies']
        },
        energy: {
          message: 'Rising energy and optimism. Great time for social activities and new projects.',
          science: 'Estrogen increases serotonin and dopamine production, boosting mood, motivation, and cognitive function.',
          suggestions: ['Start new projects', 'Social events', 'Brainstorming', 'Networking']
        },
        fasting: {
          message: 'Can handle longer fasts (16-18h) if that feels good to you.',
          science: 'Higher estrogen improves insulin sensitivity, making fasting more comfortable and effective.',
          suggestions: ['16:8 fasting', '18:6 fasting', 'Listen to your body']
        }
      },
      'Ovulatory': {
        training: {
          message: 'High intensity workouts and group classes. Peak performance window!',
          science: 'Estrogen peaks and testosterone rises. Pain tolerance is highest, and you have maximum strength and endurance.',
          suggestions: ['HIIT', 'CrossFit', 'Group fitness', 'Competitive sports', 'Max effort workouts']
        },
        nutrition: {
          message: 'Fibre and antioxidants. Your digestion is strong - enjoy raw veggies!',
          science: 'Estrogen supports gut motility and metabolism. Your body handles fibre and raw foods easily.',
          suggestions: ['Raw salads', 'Cruciferous veggies', 'Berries', 'Nuts and seeds', 'Whole grains']
        },
        energy: {
          message: 'Peak social energy! Schedule important meetings and social events now.',
          science: 'Peak estrogen enhances communication skills, confidence, and emotional connection. You\'re at your most charismatic.',
          suggestions: ['Important presentations', 'Networking events', 'Social gatherings', 'Public speaking']
        },
        fasting: {
          message: 'Flexible - your insulin sensitivity is optimal.',
          science: 'Peak estrogen optimises metabolic flexibility. You can fast or eat more freely.',
          suggestions: ['Flexible fasting', 'Intuitive eating', 'Any window works']
        }
      },
      'Luteal': {
        training: {
          message: 'Moderate intensity - pilates, swimming, or steady cardio work well.',
          science: 'Progesterone rises, which can increase body temperature and reduce exercise tolerance. Focus on sustainable movement.',
          suggestions: ['Pilates', 'Swimming', 'Barre', 'Moderate cardio', 'Strength maintenance']
        },
        nutrition: {
          message: 'Complex carbs and magnesium-rich foods. Honor cravings mindfully.',
          science: 'Progesterone increases appetite and shifts metabolism. Your body needs more calories (about 100-300 more per day).',
          suggestions: ['Oatmeal', 'Dark chocolate', 'Pumpkin seeds', 'Bananas', 'Whole grains']
        },
        energy: {
          message: 'Energy gradually declines. Focus on completing tasks and nesting.',
          science: 'Progesterone has a calming, sedating effect. This is natural preparation for your period or potential pregnancy.',
          suggestions: ['Finish projects', 'Home organization', 'Cozy activities', 'Self-care']
        },
        fasting: {
          message: 'Listen to hunger cues. Your body may need more frequent nourishment.',
          science: 'Progesterone increases appetite and metabolic rate. Fasting can trigger stress hormones and worsen PMS.',
          suggestions: ['Shorter windows', 'Eat regularly', 'Honor hunger', '12-14 hour max']
        }
      }
    };

    let guidance = baseGuidance[phase];

    if (todayInputs) {
      const sleep = parseFloat(todayInputs.sleep);
      const { mood, energy, stress } = todayInputs;

      if (sleep && sleep < 6) {
        guidance = {
          ...guidance,
          training: {
            ...guidance.training,
            message: '⚠️ Low sleep detected. Prioritize rest and gentle movement today.',
            modifier: 'Your body repairs during sleep. Without adequate rest, intense training adds stress rather than building strength.'
          },
          fasting: {
            ...guidance.fasting,
            message: '⚠️ Skip fasting today. Eat when hungry to support recovery.',
            modifier: 'Sleep deprivation disrupts hunger hormones. Your body needs consistent fuel to recover.'
          }
        };
      }

      if (stress === 'high') {
        guidance = {
          ...guidance,
          training: {
            ...guidance.training,
            message: '⚠️ High stress detected. Gentle movement like walking or yoga is best.',
            modifier: 'Cortisol is already elevated. Intense exercise adds more stress. Choose restorative movement.'
          },
          energy: {
            ...guidance.energy,
            message: '⚠️ Your nervous system needs support. Prioritize calming activities.',
            modifier: 'High cortisol can deplete neurotransmitters. Rest isn\'t lazy - it\'s essential.'
          },
          fasting: {
            ...guidance.fasting,
            message: '⚠️ Eat regularly today. Fasting adds stress when cortisol is high.',
            modifier: 'Fasting triggers cortisol release. With stress already high, this compounds the problem.'
          }
        };
      }

      if (energy === 'low' && phase === 'Luteal') {
        guidance = {
          ...guidance,
          training: {
            ...guidance.training,
            message: 'Low energy in late luteal is completely normal. Light stretching or rest.',
            modifier: 'Progesterone naturally lowers energy. This is your body preparing for menstruation - honour it.'
          }
        };
      }

      if (mood === 'poor') {
        guidance = {
          ...guidance,
          energy: {
            ...guidance.energy,
            message: 'Low mood is okay. Movement can help, but so can rest. Do what feels right.',
            modifier: 'Gentle exercise releases endorphins, but forcing yourself backfires. Listen to your needs.'
          }
        };
      }
    }

    return guidance;
  };

  // Onboarding Steps
  const OnboardingWelcome = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 flex items-center justify-center p-6" style={{fontFamily: 'Lexend, sans-serif'}}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-indigo-200">
        <div className="text-center space-y-4">
          <div className="text-6xl">🌙</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">Welcome</h1>
          <p className="text-xl text-indigo-900 leading-relaxed font-medium">
            Your body, your data, your choice
          </p>
          <p className="text-gray-600">
            Make kinder, smarter decisions around training, nutrition, and energy based on your cycle.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-6 space-y-4 border border-indigo-200">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-semibold text-indigo-900">Privacy First</h3>
              <p className="text-sm text-indigo-700">All data stays on your device, under your control</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="font-semibold text-indigo-900">Personalised Guidance</h3>
              <p className="text-sm text-indigo-700">Recommendations that adapt to your unique rhythm</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep(1)}
          className="w-full bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:from-indigo-800 hover:to-purple-900 transform hover:scale-105 transition-all"
        >
          Get Started
        </button>
      </div>
    </div>
  );

  const OnboardingPeriodStart = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 flex items-center justify-center p-6" style={{fontFamily: 'Lexend, sans-serif'}}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-indigo-200">
        <div className="space-y-2">
          <div className="text-4xl">🌸</div>
          <h2 className="text-2xl font-bold text-indigo-900">When did your last period start?</h2>
          <p className="text-gray-600">This helps us understand where you are in your cycle</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-indigo-900 mb-2">
              First day of bleeding
            </label>
            <input
              type="date"
              value={onboardingData.lastPeriodStart}
              onChange={(e) => setOnboardingData({...onboardingData, lastPeriodStart: e.target.value})}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-lg"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep(0)}
            className="flex-1 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition border border-indigo-200"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            disabled={!onboardingData.lastPeriodStart}
            className="flex-1 bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const OnboardingPeriodEnd = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 flex items-center justify-center p-6" style={{fontFamily: 'Lexend, sans-serif'}}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-indigo-200">
        <div className="space-y-2">
          <div className="text-4xl">🌺</div>
          <h2 className="text-2xl font-bold text-indigo-900">When did it end?</h2>
          <p className="text-gray-600">Or approximately how long did it last?</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-indigo-900 mb-2">
              Last day of bleeding
            </label>
            <input
              type="date"
              value={onboardingData.lastPeriodEnd}
              onChange={(e) => setOnboardingData({...onboardingData, lastPeriodEnd: e.target.value})}
              min={onboardingData.lastPeriodStart}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-lg"
            />
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-900">
              💡 If you're not sure of the exact date, that's okay! An estimate helps us personalise your guidance.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition border border-indigo-200"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            disabled={!onboardingData.lastPeriodEnd}
            className="flex-1 bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const OnboardingCycleLength = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 flex items-center justify-center p-6" style={{fontFamily: 'Lexend, sans-serif'}}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-indigo-200">
        <div className="space-y-2">
          <div className="text-4xl">🌙</div>
          <h2 className="text-2xl font-bold text-indigo-900">About your cycle</h2>
          <p className="text-gray-600">Help us understand your typical rhythm</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-indigo-900 mb-2">
              Average cycle length (days)
            </label>
            <input
              type="number"
              value={onboardingData.averageCycleLength}
              onChange={(e) => setOnboardingData({...onboardingData, averageCycleLength: parseInt(e.target.value)})}
              min="21"
              max="45"
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">From first day of period to first day of next period (typically 21-35 days)</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-100 border-2 border-indigo-200 rounded-xl p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={onboardingData.isIrregular}
                onChange={(e) => setOnboardingData({...onboardingData, isIrregular: e.target.checked})}
                className="mt-1 h-5 w-5 text-indigo-700 rounded focus:ring-indigo-500 border-indigo-300"
              />
              <div>
                <p className="font-semibold text-indigo-900">My cycle is irregular</p>
                <p className="text-sm text-indigo-700">We'll use wider prediction windows and focus on symptoms</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex-1 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition border border-indigo-200"
          >
            Back
          </button>
          <button
            onClick={() => {
              completeOnboarding();
            }}
            className="flex-1 bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );

  // Daily Log View
  const LogView = () => {
    const today = new Date().toISOString().split('T')[0];
    const existingLog = userData?.dailyLogs?.[today];

    const saveTodayLog = () => {
      const updatedData = {
        ...userData,
        dailyLogs: {
          ...userData.dailyLogs,
          [today]: {
            ...todayLog,
            timestamp: new Date().toISOString()
          }
        }
      };
      saveUserData(updatedData);
      setCurrentView('today');
      setTodayLog({
        sleep: '',
        mood: '',
        energy: '',
        stress: '',
        workout: { type: '', intensity: '', notes: '' },
        fasting: '',
        notes: ''
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 pb-32" style={{fontFamily: 'Lexend, sans-serif'}}>
        <div className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">Log Today</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-indigo-100 space-y-6">
            {existingLog && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800">✓ You've already logged today! Update your entries below.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                💤 Hours of Sleep
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="12"
                value={todayLog.sleep}
                onChange={(e) => setTodayLog({...todayLog, sleep: e.target.value})}
                placeholder="7.5"
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-3">
                😊 Mood
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['poor', 'okay', 'good', 'great'].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setTodayLog({...todayLog, mood})}
                    className={`py-3 px-4 rounded-xl font-medium capitalize transition ${
                      todayLog.mood === mood
                        ? 'bg-indigo-700 text-white shadow-lg'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-3">
                ⚡ Energy Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map((energy) => (
                  <button
                    key={energy}
                    onClick={() => setTodayLog({...todayLog, energy})}
                    className={`py-3 px-4 rounded-xl font-medium capitalize transition ${
                      todayLog.energy === energy
                        ? 'bg-indigo-700 text-white shadow-lg'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    {energy}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-3">
                😰 Stress Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map((stress) => (
                  <button
                    key={stress}
                    onClick={() => setTodayLog({...todayLog, stress})}
                    className={`py-3 px-4 rounded-xl font-medium capitalize transition ${
                      todayLog.stress === stress
                        ? 'bg-indigo-700 text-white shadow-lg'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    {stress}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-indigo-100"></div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                🏋️ Workout <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={todayLog.workout.type}
                onChange={(e) => setTodayLog({...todayLog, workout: {...todayLog.workout, type: e.target.value}})}
                placeholder="e.g., Strength training, Yoga, HIIT"
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none mb-2"
              />
              
              <div className="mb-2">
                <label className="block text-xs text-gray-600 mb-2">Intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => setTodayLog({...todayLog, workout: {...todayLog.workout, intensity}})}
                      className={`py-2 px-3 rounded-lg font-medium capitalize text-sm transition ${
                        todayLog.workout.intensity === intensity
                          ? 'bg-indigo-700 text-white shadow-lg'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={todayLog.workout.notes}
                onChange={(e) => setTodayLog({...todayLog, workout: {...todayLog.workout, notes: e.target.value}})}
                placeholder="How did it feel?"
                rows="2"
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                ⏰ Fasting Window <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={todayLog.fasting}
                onChange={(e) => setTodayLog({...todayLog, fasting: e.target.value})}
                placeholder="e.g., 16:8, 18:6, or skip"
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                📝 Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={todayLog.notes}
                onChange={(e) => setTodayLog({...todayLog, notes: e.target.value})}
                placeholder="Anything else you want to remember about today?"
                rows="3"
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none"
              />
            </div>
          </div>

          <button
            onClick={saveTodayLog}
            disabled={!todayLog.sleep || !todayLog.mood || !todayLog.energy || !todayLog.stress}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {existingLog ? 'Update Log' : 'Save Log'}
          </button>

          <button
            onClick={() => setCurrentView('today')}
            className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition border border-indigo-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Me/Settings View
  const MeView = () => {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
      lastPeriodStart: '',
      lastPeriodEnd: '',
      averageCycleLength: 28,
      averagePeriodLength: 5,
      isIrregular: false
    });

    const calculateStreak = () => {
      const logs = userData?.dailyLogs || {};
      const dates = Object.keys(logs).sort().reverse();
      
      if (dates.length === 0) return 0;
      
      const today = new Date().toISOString().split('T')[0];
      let streak = 0;
      let currentDate = new Date();
      
      // Check if today is logged
      if (!logs[today]) {
        // If today isn't logged, check if yesterday was (grace period)
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterday = currentDate.toISOString().split('T')[0];
        if (!logs[yesterday]) return 0;
      }
      
      // Count backwards from today
      currentDate = new Date();
      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (logs[dateStr]) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      return streak;
    };

    const startEditingProfile = () => {
      setEditedProfile({
        lastPeriodStart: userData.profile.lastPeriodStart,
        lastPeriodEnd: userData.profile.lastPeriodEnd,
        averageCycleLength: userData.profile.averageCycleLength,
        averagePeriodLength: userData.profile.averagePeriodLength,
        isIrregular: userData.profile.isIrregular
      });
      setIsEditingProfile(true);
    };

    const saveProfileEdits = () => {
      const updatedData = {
        ...userData,
        profile: {
          ...userData.profile,
          ...editedProfile
        }
      };
      saveUserData(updatedData);
      setIsEditingProfile(false);
    };

    const exportData = () => {
      const dataStr = JSON.stringify(userData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `miriam-cycle-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const importData = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          saveUserData(imported);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };

    const clearAllData = () => {
      if (window.confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
        if (window.confirm('Really delete everything? This is permanent.')) {
          localStorage.removeItem('cycleAppData');
          window.location.reload();
        }
      }
    };

    const streak = calculateStreak();
    const daysLogged = Object.keys(userData?.dailyLogs || {}).length;
    const cyclesTracked = userData?.periodHistory?.length || 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 pb-32" style={{fontFamily: 'Lexend, sans-serif'}}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">Me</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Data Stats */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-indigo-100">
            <h2 className="text-lg font-bold text-indigo-900 mb-4">Your Progress</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="text-sm text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-indigo-900">{streak} days</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-sm text-gray-600 mb-1">Days Logged</p>
                  <p className="text-2xl font-bold text-indigo-900">{daysLogged}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-sm text-gray-600 mb-1">Cycles Tracked</p>
                  <p className="text-2xl font-bold text-purple-900">{cyclesTracked}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-indigo-900">Your Profile</h2>
              {!isEditingProfile && (
                <button
                  onClick={startEditingProfile}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Edit
                </button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-indigo-50">
                  <span className="text-gray-600">Cycle Length</span>
                  <span className="font-semibold text-indigo-900">{userData.profile.averageCycleLength} days</span>
                </div>
                <div className="flex justify-between py-2 border-b border-indigo-50">
                  <span className="text-gray-600">Period Length</span>
                  <span className="font-semibold text-indigo-900">{userData.profile.averagePeriodLength} days</span>
                </div>
                <div className="flex justify-between py-2 border-b border-indigo-50">
                  <span className="text-gray-600">Last Period Start</span>
                  <span className="font-semibold text-indigo-900">{new Date(userData.profile.lastPeriodStart).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-indigo-50">
                  <span className="text-gray-600">Last Period End</span>
                  <span className="font-semibold text-indigo-900">{new Date(userData.profile.lastPeriodEnd).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Irregular Cycle</span>
                  <span className="font-semibold text-indigo-900">{userData.profile.isIrregular ? 'Yes' : 'No'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-2">
                    Last Period Start
                  </label>
                  <input
                    type="date"
                    value={editedProfile.lastPeriodStart}
                    onChange={(e) => setEditedProfile({...editedProfile, lastPeriodStart: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-2">
                    Last Period End
                  </label>
                  <input
                    type="date"
                    value={editedProfile.lastPeriodEnd}
                    onChange={(e) => setEditedProfile({...editedProfile, lastPeriodEnd: e.target.value})}
                    min={editedProfile.lastPeriodStart}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-2">
                    Average Cycle Length (days)
                  </label>
                  <input
                    type="number"
                    value={editedProfile.averageCycleLength}
                    onChange={(e) => setEditedProfile({...editedProfile, averageCycleLength: parseInt(e.target.value)})}
                    min="21"
                    max="45"
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-2">
                    Average Period Length (days)
                  </label>
                  <input
                    type="number"
                    value={editedProfile.averagePeriodLength}
                    onChange={(e) => setEditedProfile({...editedProfile, averagePeriodLength: parseInt(e.target.value)})}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedProfile.isIrregular}
                      onChange={(e) => setEditedProfile({...editedProfile, isIrregular: e.target.checked})}
                      className="mt-1 h-5 w-5 text-indigo-700 rounded focus:ring-indigo-500 border-indigo-300"
                    />
                    <div>
                      <p className="font-semibold text-indigo-900">My cycle is irregular</p>
                      <p className="text-sm text-indigo-700">Cycles vary by more than 7 days</p>
                    </div>
                  </label>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfileEdits}
                    className="flex-1 bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-lg border-2 border-indigo-200">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🔒</span>
              <div>
                <h3 className="font-bold text-indigo-900 mb-2">Your Data is Private</h3>
                <p className="text-sm text-indigo-800 leading-relaxed">
                  All your data is stored locally on this device. Nothing is sent to any server or cloud service. You have complete control.
                </p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-indigo-100 space-y-4">
            <h2 className="text-lg font-bold text-indigo-900">Data Management</h2>
            
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📥</span>
                  <div className="text-left">
                    <p className="font-semibold text-indigo-900">Export Data</p>
                    <p className="text-xs text-gray-600">Download a backup file</p>
                  </div>
                </div>
                <span className="text-indigo-600">→</span>
              </button>

              <label className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📤</span>
                  <div className="text-left">
                    <p className="font-semibold text-indigo-900">Import Data</p>
                    <p className="text-xs text-gray-600">Restore from a backup file</p>
                  </div>
                </div>
                <span className="text-indigo-600">→</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>

              <button
                onClick={clearAllData}
                className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🗑️</span>
                  <div className="text-left">
                    <p className="font-semibold text-red-900">Clear All Data</p>
                    <p className="text-xs text-red-600">Permanently delete everything</p>
                  </div>
                </div>
                <span className="text-red-600">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-indigo-100 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center gap-2">
              <button 
                onClick={() => setCurrentView('today')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-2xl">🏠</span>
                <span className="text-xs font-medium mt-1">Today</span>
              </button>
              <button 
                onClick={() => setCurrentView('cycle')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-2xl">📅</span>
                <span className="text-xs font-medium mt-1">Cycle</span>
              </button>
              <button 
                onClick={() => setCurrentView('log')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-2xl">📝</span>
                <span className="text-xs font-medium mt-1">Log</span>
              </button>
              <button 
                onClick={() => setCurrentView('me')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-indigo-700 bg-indigo-50"
              >
                <span className="text-2xl">👤</span>
                <span className="text-xs font-semibold mt-1">Me</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cycle Calendar View
  const CycleView = () => {
    // Generate full current cycle (Day 1 to Day cycleLength)
    const getCurrentCycle = () => {
      const days = [];
      const periodStart = new Date(userData.profile.lastPeriodStart);
      const cycleLength = userData.profile.averageCycleLength;
      const today = new Date();
      
      for (let cycleDay = 1; cycleDay <= cycleLength; cycleDay++) {
        const date = new Date(periodStart);
        date.setDate(periodStart.getDate() + (cycleDay - 1));
        
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === today.toISOString().split('T')[0];
        const isPast = date < today && !isToday;
        const hasLog = userData?.dailyLogs?.[dateStr];
        
        let phase, phaseColor, phaseIcon, phaseName;
        
        if (cycleDay <= userData.profile.averagePeriodLength) {
          phase = 'menstrual';
          phaseName = 'Menstrual';
          phaseColor = 'bg-[#8C48AE]';
          phaseIcon = '🌑';
        } else if (cycleDay <= 13) {
          phase = 'follicular';
          phaseName = 'Follicular';
          phaseColor = 'bg-[#FFDAB9]';
          phaseIcon = '🌒';
        } else if (cycleDay <= 16) {
          phase = 'ovulatory';
          phaseName = 'Ovulatory';
          phaseColor = 'bg-[#E08C34]';
          phaseIcon = '🌕';
        } else {
          phase = 'luteal';
          phaseName = 'Luteal';
          phaseColor = 'bg-[#E9D8E6]';
          phaseIcon = '🌖';
        }
        
        days.push({
          cycleDay,
          date,
          dateStr,
          dayNum: date.getDate(),
          monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday,
          isPast,
          hasLog,
          phase,
          phaseName,
          phaseColor,
          phaseIcon
        });
      }
      
      return days;
    };
    
    const cycleDays = getCurrentCycle();
    const phaseRanges = {
      menstrual: { start: 1, end: userData.profile.averagePeriodLength },
      follicular: { start: userData.profile.averagePeriodLength + 1, end: 13 },
      ovulatory: { start: 14, end: 16 },
      luteal: { start: 17, end: userData.profile.averageCycleLength }
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 pb-32" style={{fontFamily: 'Lexend, sans-serif'}}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">This Cycle</h1>
            <p className="text-sm text-gray-600 mt-1">
              {cycleDays[0].date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {cycleDays[cycleDays.length - 1].date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Phase Legend */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-3">Phase Guide</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg" style={{backgroundColor: '#8C48AE'}}></div>
                <div className="text-sm">
                  <p className="font-semibold text-indigo-900">Menstrual</p>
                  <p className="text-gray-600 text-xs">Days {phaseRanges.menstrual.start}-{phaseRanges.menstrual.end}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg" style={{backgroundColor: '#FFDAB9'}}></div>
                <div className="text-sm">
                  <p className="font-semibold text-indigo-900">Follicular</p>
                  <p className="text-gray-600 text-xs">Days {phaseRanges.follicular.start}-{phaseRanges.follicular.end}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg" style={{backgroundColor: '#E08C34'}}></div>
                <div className="text-sm">
                  <p className="font-semibold text-indigo-900">Ovulatory</p>
                  <p className="text-gray-600 text-xs">Days {phaseRanges.ovulatory.start}-{phaseRanges.ovulatory.end}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg" style={{backgroundColor: '#E9D8E6'}}></div>
                <div className="text-sm">
                  <p className="font-semibold text-indigo-900">Luteal</p>
                  <p className="text-gray-600 text-xs">Days {phaseRanges.luteal.start}-{phaseRanges.luteal.end}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-indigo-100">
            <div className="grid grid-cols-7 gap-2">
              {cycleDays.map((day) => {
                const bgColors = {
                  'menstrual': '#8C48AE',
                  'follicular': '#FFDAB9', 
                  'ovulatory': '#E08C34',
                  'luteal': '#E9D8E6'
                };
                
                const textColor = (day.phase === 'menstrual' || day.phase === 'ovulatory') ? '#FFFFFF' : '#1F2937';
                
                return (
                  <div 
                    key={day.cycleDay}
                    style={{
                      backgroundColor: bgColors[day.phase],
                      color: textColor
                    }}
                    className={`
                      rounded-xl p-3 relative
                      ${day.isToday ? 'ring-4 ring-orange-400 shadow-xl scale-105' : 'shadow-md'}
                      ${day.isPast ? 'opacity-60' : ''}
                      transition-all
                    `}
                  >
                    <div className="text-center">
                      <p className="text-xs font-medium opacity-90">{day.dayName}</p>
                      <p className="text-xl font-bold">{day.dayNum}</p>
                      <p className="text-xs opacity-75">{day.monthShort}</p>
                      <p className="text-xs font-semibold mt-1">Day {day.cycleDay}</p>
                    </div>
                    {day.hasLog && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                    {day.isToday && (
                      <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        TODAY
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-indigo-100 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center gap-2">
              <button 
                onClick={() => setCurrentView('today')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-2xl">🏠</span>
                <span className="text-xs font-medium mt-1">Today</span>
              </button>
              <button 
                onClick={() => setCurrentView('cycle')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-indigo-700 bg-indigo-50"
              >
                <span className="text-2xl">📅</span>
                <span className="text-xs font-semibold mt-1">Cycle</span>
              </button>
              <button 
                onClick={() => setCurrentView('log')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-2xl">📝</span>
                <span className="text-xs font-medium mt-1">Log</span>
              </button>
              <button 
                onClick={() => setCurrentView('me')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-2xl">👤</span>
                <span className="text-xs font-medium mt-1">Me</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Today View
  const TodayView = () => {
    const phaseInfo = calculatePhase();
    const today = new Date().toISOString().split('T')[0];
    const todayData = userData?.dailyLogs?.[today];
    const guidance = phaseInfo ? getGuidance(phaseInfo.phase, todayData) : null;
    
    const [expandedCard, setExpandedCard] = useState(null);
    
    if (!phaseInfo) return null;

    const GuidanceCard = ({ icon, title, category, data }) => (
      <div className="bg-white rounded-2xl p-5 shadow-md border border-indigo-100 hover:shadow-lg transition">
        <div className="flex items-start space-x-3">
          <span className="text-3xl">{icon}</span>
          <div className="flex-1">
            <h4 className="font-bold text-lg text-indigo-900">{title}</h4>
            <p className="text-gray-700 mt-2 leading-relaxed">
              {data.message}
            </p>
            {data.modifier && (
              <p className="text-orange-700 mt-2 text-sm bg-orange-50 rounded-lg p-3 border border-orange-200">
                <strong>Why:</strong> {data.modifier}
              </p>
            )}
            <button
              onClick={() => setExpandedCard(expandedCard === category ? null : category)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-3 flex items-center space-x-1"
            >
              <span>{expandedCard === category ? '▼' : '▶'}</span>
              <span>{expandedCard === category ? 'Hide' : 'Why this matters'}</span>
            </button>
            {expandedCard === category && (
              <div className="mt-3 bg-indigo-50 rounded-xl p-4 space-y-2 border border-indigo-100">
                <p className="text-sm text-indigo-900">
                  <strong>The Science:</strong> {data.science}
                </p>
                {data.suggestions && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-indigo-900 mb-1">Try:</p>
                    <div className="flex flex-wrap gap-2">
                      {data.suggestions.map((suggestion, idx) => (
                        <span key={idx} className="text-xs bg-white text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100" style={{fontFamily: 'Lexend, sans-serif'}}>
        <div className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">🌙 miriam</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 pb-32">
          <div className={`bg-gradient-to-r ${phaseInfo.phaseColor} rounded-3xl p-8 text-white shadow-xl`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Day {phaseInfo.cycleDay} of {userData.profile.averageCycleLength}</p>
                  <h2 className="text-4xl font-bold mt-1">{phaseInfo.phase} Phase</h2>
                  <p className="text-white/90 mt-2">Day {phaseInfo.phaseDay} of this phase</p>
                </div>
                <div className="text-6xl">
                  {phaseInfo.phase === 'Menstrual' && '🌑'}
                  {phaseInfo.phase === 'Follicular' && '🌒'}
                  {phaseInfo.phase === 'Ovulatory' && '🌕'}
                  {phaseInfo.phase === 'Luteal' && '🌖'}
                </div>
              </div>
            </div>
          </div>

          {!todayData ? (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
              <p className="text-orange-900 font-medium">
                💡 Log your sleep, mood, and energy to get personalised guidance
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <p className="text-green-900 font-medium">
                ✓ Today's data logged! Your guidance is personalised below.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-indigo-900">Today's Guidance</h3>
            
            <div className="space-y-4">
              <GuidanceCard icon="🏋️" title="Training" category="training" data={guidance.training} />
              <GuidanceCard icon="🥗" title="Nutrition" category="nutrition" data={guidance.nutrition} />
              <GuidanceCard icon="⚡" title="Energy & Social" category="energy" data={guidance.energy} />
              <GuidanceCard icon="⏰" title="Fasting" category="fasting" data={guidance.fasting} />
            </div>
          </div>

          <button 
            onClick={() => setCurrentView('log')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all"
          >
            {todayData ? 'Update Today\'s Log' : 'Log Today\'s Data'}
          </button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-indigo-100 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center gap-2">
              <button 
                onClick={() => setCurrentView('today')}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${currentView === 'today' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                <span className="text-2xl">🏠</span>
                <span className="text-xs font-semibold mt-1">Today</span>
              </button>
              <button 
                onClick={() => setCurrentView('cycle')}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${currentView === 'cycle' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                <span className="text-2xl">📅</span>
                <span className="text-xs font-medium mt-1">Cycle</span>
              </button>
              <button 
                onClick={() => setCurrentView('log')}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${currentView === 'log' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                <span className="text-2xl">📝</span>
                <span className="text-xs font-medium mt-1">Log</span>
              </button>
              <button 
                onClick={() => setCurrentView('me')}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${currentView === 'me' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                <span className="text-2xl">👤</span>
                <span className="text-xs font-medium mt-1">Me</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!userData) {
    if (currentStep === 0) return <OnboardingWelcome />;
    if (currentStep === 1) return <OnboardingPeriodStart />;
    if (currentStep === 2) return <OnboardingPeriodEnd />;
    if (currentStep === 3) return <OnboardingCycleLength />;
  }

  if (currentView === 'log') return <LogView />;
  if (currentView === 'cycle') return <CycleView />;
  if (currentView === 'me') return <MeView />;
  if (currentView === 'today') return <TodayView />;
  
  return <TodayView />;
};

export default CycleApp;
