import React, { useState, useEffect } from 'react';

// Import Lexend font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const CycleApp = () => {
  const [userData, setUserData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentView, setCurrentView] = useState('today'); // 'today', 'cycle', 'log', 'learn', 'me', 'about'
  const [learnPhase, setLearnPhase] = useState(null);
  const [onboardingData, setOnboardingData] = useState({
    lastPeriodStart: '',
    lastPeriodEnd: '',
    averageCycleLength: 28,
    averagePeriodLength: 5,
    isIrregular: false
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
    } else if (cycleDay <= 23) {
      phase = 'Early Luteal';
      phaseDay = cycleDay - 16;
      phaseColor = 'from-purple-600 to-indigo-700';
    } else {
      phase = 'Late Luteal';
      phaseDay = cycleDay - 23;
      phaseColor = 'from-purple-700 to-indigo-800';
    }
    
    return { phase, cycleDay, phaseDay, phaseColor };
  };

  // Get guidance based on phase and daily inputs
  const getGuidance = (phase, todayInputs = null) => {
    const baseGuidance = {
      'Menstrual': {
        training: {
          message: 'Gentle movement, yoga, or walks. Honour your body\'s need for rest.',
          science: 'During menstruation, progesterone and estrogen are at their lowest. Energy levels naturally dip, and your body is focused on shedding the uterine lining.',
          suggestions: ['Restorative yoga', 'Walking', 'Gentle stretching', 'Rest days']
        },
        nutrition: {
          message: 'Iron-rich foods and anti-inflammatory meals. Warming soups and stews.',
          science: 'You\'re losing iron through menstruation. Anti-inflammatory foods help reduce prostaglandins that cause cramping.',
          suggestions: ['Leafy greens', 'Red meat or lentils', 'Ginger tea', 'Turmeric', 'Bone broth']
        },
        energy: {
          message: 'Rest is productive. Low social energy is natural, say no without guilt or keep it close 💖',
          science: 'Low hormone levels can affect mood and energy. This is a natural time for introspection and rest.',
          suggestions: ['Journal', 'Light social activities', 'Early bedtime', 'Self compassion']
        },
        fasting: {
          message: 'Nourishment first, your body needs the fuel',
          science: 'Your body needs consistent fuel during menstruation. Not eating can trigger cortisol release when energy is already low.',
          suggestions: ['Eat when hungry', 'Focus on nourishment']
        }
      },
      'Follicular': {
        training: {
          message: 'Perfect time for strength training and HIIT. Your body is primed for power!',
          science: 'Rising estrogen improves insulin sensitivity, muscle protein synthesis, and pain tolerance. You recover faster and build strength more efficiently.',
          suggestions: ['Heavy lifts', 'HIIT', 'New PRs', 'Pushing feels good']
        },
        nutrition: {
          message: 'Higher whole carbs with lean protein. Fiber-rich foods support rising energy and your digestion is strong.',
          science: 'Estrogen enhances carbohydrate metabolism. Your body efficiently uses carbs for energy and muscle building.',
          suggestions: ['Kimchi & Kefir', 'Sweet potatoes', 'Chicken, Fish', 'Summer Rolls', 'steamed']
        },
        energy: {
          message: 'Rising energy and optimism. Great time for social activities and new projects.',
          science: 'Estrogen increases serotonin and dopamine production, boosting mood, motivation, and cognitive function.',
          suggestions: ['Start new projects', 'Social events', 'Dating', 'Networking']
        },
        fasting: {
          message: 'Do what feels good to you, listen to your body.',
          science: 'Higher estrogen improves insulin sensitivity so fasting is tolerated, but pay attention to hunger cues.',
          suggestions: ['Listen to your body', 'Nourish your activity']
        }
      },
      'Ovulatory': {
        training: {
          message: 'High intensity workouts and group classes. Peak performance window!',
          science: 'Estrogen peaks and testosterone rises. Pain tolerance is highest, and you have maximum strength and endurance.',
          suggestions: ['I can do anything', 'HIIT', 'Group fitness', 'Compete with yourself']
        },
        nutrition: {
          message: 'Fibre and antioxidants. Your digestion is strong 💪 enjoy raw veggies!',
          science: 'Estrogen supports gut motility and metabolism. Your body handles fibre and raw foods easily.',
          suggestions: ['Fatty fish', 'Berries', 'Colourful vegetables', 'Nuts and seeds', 'Whole grains']
        },
        energy: {
          message: 'Peak social energy! Schedule important meetings and social events now.',
          science: 'Peak estrogen enhances communication skills, confidence, and emotional connection. You\'re at your most charismatic and pheromones are strong.',
          suggestions: ['Networking events', 'Social gatherings', 'Safe sex', 'Dating', 'Public speaking']
        },
        fasting: {
          message: 'Flexible, your insulin sensitivity is optimal.',
          science: 'Peak estrogen optimises metabolic flexibility. You can fast or eat more freely.',
          suggestions: ['Intuitive eating', 'Any window works']
        }
      },
      'Luteal': {
        training: {
          message: 'Moderate intensity movement, pilates, swimming, or steady cardio work well.',
          science: 'Progesterone rises, which can increase body temperature and reduce exercise tolerance. Focus on sustainable movement.',
          suggestions: ['Pilates', 'Swimming', 'Moderate cardio', 'Strength maintenance']
        },
        nutrition: {
          message: 'Complex carbs and magnesium-rich foods. Honour cravings mindfully.',
          science: 'Progesterone increases appetite and shifts metabolism. Your body needs more calories (about 100-300 more per day).',
          suggestions: ['Oatmeal', 'Dark chocolate', 'Pumpkin seeds', 'Bananas', 'Whole grains']
        },
        energy: {
          message: 'Energy gradually declines. Focus on completing tasks and nesting.',
          science: 'Progesterone has a calming, sedating effect. This is natural preparation for your period or potential pregnancy.',
          suggestions: ['Finish projects', 'Home organisation', 'Cozy activities', 'Self-care']
        },
        fasting: {
          message: 'Listen to hunger cues. Your body may need more frequent nourishment.',
          science: 'Progesterone increases appetite and metabolic rate. Fasting can trigger stress hormones and worsen PMS.',
          suggestions: ['Shorter windows', 'Eat regularly', 'Honour hunger']
        }
      },
      'Early Luteal': {
        training: {
          message: 'Moderate intensity works well. Pilates, swimming, barre, or steady cardio.',
          science: 'Progesterone rises and body temperature increases slightly. You can still train well, but recovery takes a bit longer than follicular phase.',
          suggestions: ['Pilates', 'Swimming', 'Moderate strength training', 'Steady cardio']
        },
        nutrition: {
          message: 'Complex carbs with protein. Your appetite is increasing which is normal.',
          science: 'Metabolic rate rises by 100-300 calories per day. Your body genuinely needs more food as progesterone increases.',
          suggestions: ['Whole grains', 'Potatoes', 'Salmon', 'Spinach', 'Nut butters']
        },
        energy: {
          message: 'Productive energy for completing tasks. Good time to finish what you started.',
          science: 'Progesterone has a calming effect that can feel centring and focused. Less sparkle than ovulation, but steady.',
          suggestions: ['Finish projects', 'Admin work', 'Organising', 'Small social gatherings']
        },
        fasting: {
          message: 'Your body needs more fuel as metabolism rises.',
          science: 'Progesterone increases metabolic rate and appetite. Not honouring hunger may not feel comfortable.',
          suggestions: ['Listen to hunger', 'Eat regularly']
        }
      },
      'Late Luteal': {
        training: {
          message: 'Gentle movement - walking, stretching, restorative yoga. Rest is productive.',
          science: 'Progesterone drops sharply, which can affect energy and mood. Your body is preparing for menstruation. Intense training adds stress.',
          suggestions: ['Walking', 'Yin yoga', 'Stretching', 'Rest days']
        },
        nutrition: {
          message: 'Magnesium-rich foods, complex carbs, and honouring cravings. You need MORE food, not less.',
          science: 'Serotonin drops with declining hormones, triggering carb cravings. Your metabolic rate is still elevated. Restricting food worsens PMS significantly.',
          suggestions: ['Chickpeas', 'Dates', 'Grounding foods', 'Nothing cold', 'Dark chocolate', 'Satisfying meals']
        },
        energy: {
          message: 'Low energy and irritability are normal. PMS is real. Be gentle with yourself.',
          science: 'Sharp hormone drops affect neurotransmitters. Your tolerance for stress decreases biologically.',
          suggestions: ['Say no to obligations', 'Rest', 'Solo time', 'Gentle self-care', 'Early bedtime']
        },
        fasting: {
          message: 'Eat regularly to stabilise mood, blood sugar and energy.',
          science: 'Fasting triggers cortisol release. With hormones already dropping, this compounds stress and worsens PMS dramatically.',
          suggestions: ['Eat when hungry', 'Regular meals', 'Nourishment first', 'No fasting']
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
            message: '⚠️ Low sleep detected. Prioritise rest and gentle movement today.',
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
            message: '⚠️ Your nervous system needs support. Prioritise calming activities.',
            modifier: 'High cortisol can deplete neurotransmitters. Rest isn\'t lazy - it\'s essential.'
          },
          fasting: {
            ...guidance.fasting,
            message: '⚠️ Eat regularly today. Fasting adds stress when cortisol is high.',
            modifier: 'Fasting triggers cortisol release. With stress already high, this compounds the problem.'
          }
        };
      }

      if (energy === 'low' && (phase === 'Luteal' || phase === 'Late Luteal' || phase === 'Early Luteal')) {
        guidance = {
          ...guidance,
          training: {
            ...guidance.training,
            message: 'Low energy in luteal phase is completely normal. Light stretching or rest.',
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

  // Phase guide content for Learn tab
  const phaseGuides = {
    Menstrual: {
      title: 'Menstrual Phase',
      subtitle: 'Inner Winter',
      icon: '🌑',
      color: 'from-indigo-800 to-purple-900',
      cardBg: 'bg-gradient-to-br from-purple-100 to-indigo-100',
      days: 'Days 1–5',
      overview: 'Estrogen and progesterone drop to their lowest levels, triggering menstruation. Your body sheds the uterine lining built up during the previous cycle. Your basal metabolic rate is at its lowest point.',
      sections: [
        {
          title: 'How You Might Feel',
          icon: '💭',
          summary: '• Lower energy and need for rest\n• Inward, reflective mood\n• Possible cramping, lower back pain, headaches\n• Less social energy\n• Relief once bleeding starts',
          details: 'Low hormone levels affect neurotransmitter production (serotonin, dopamine). Prostaglandins cause uterine contractions, which can trigger cramping and inflammation throughout the body.',
        },
        {
          title: 'Training & Movement',
          icon: '🏃‍♀️',
          summary: 'What works well: Gentle yoga (restorative or yin), walking in nature, stretching and mobility work, light swimming, or complete rest.\n\nApproach carefully: High-intensity exercise, heavy lifting, long endurance efforts.',
          details: 'Pain tolerance is lower, core temperature is lower, overall energy is reduced, and inflammation may be elevated if cramping is present.\n\nTCM views this as the "Blood phase" — your body is releasing and cleansing. Gentle movement helps Qi circulate without depleting it. Ayurveda notes Vata is dominant — you need grounding, not depletion.\n\nMany people find movement helps cramping (endorphins are natural pain relievers), but pushing too hard backfires. Listen to your body.',
          suggestions: ['Restorative yoga', 'Walking in nature', 'Stretching', 'Light swimming', 'Rest days'],
        },
        {
          title: 'Nutrition',
          icon: '🥗',
          summary: 'Prioritise: Iron-rich foods (red meat, lentils, dark leafy greens, pumpkin seeds), anti-inflammatory foods (ginger, turmeric, fatty fish, berries), magnesium (dark chocolate, almonds, avocado), and warming, easy-to-digest meals.',
          details: 'You\'re losing iron through bleeding, especially if flow is heavy. Inflammation may be elevated and digestive capacity may be lower.\n\nConsider limiting caffeine (can worsen cramping), high-sodium processed foods (increases bloating), and alcohol (affects hormone clearance).\n\nTCM recommends building Blood with bone broth, red dates, goji berries, and warming foods. Ayurveda suggests Vata-calming foods: warm, moist, grounding — cooked grains, root vegetables, ghee.',
          suggestions: ['Leafy greens', 'Ginger tea', 'Bone broth', 'Dark chocolate', 'Warming soups'],
        },
        {
          title: 'Energy & Social',
          icon: '⚡',
          summary: '• Saying no to social obligations without guilt\n• Journaling, creative reflection\n• Cozy, low-key activities\n• Time alone or with very close friends\n• Early bedtimes\n• Gentle self-compassion',
          details: 'Low estrogen means lower serotonin and dopamine. Your body\'s natural rhythm is inviting introspection and rest. This is your body\'s natural time to reflect, process, and restore.',
        },
        {
          title: 'Meal Timing',
          icon: '🕐',
          summary: '• Eat when hungry — honour your body\'s signals\n• Regular meals may help stabilise energy and mood\n• Focus on nourishment, not restriction',
          details: 'Your body needs consistent fuel. Blood sugar regulation may be more challenging with low hormones. Fasting can trigger cortisol release when your body is already depleted.',
        },
        {
          title: 'Common Experiences',
          icon: '📋',
          summary: '• Cramping from prostaglandins\n• Heavy first day (the body\'s "big release")\n• Lower back pain\n• Headaches from estrogen withdrawal\n• Brain fog\n• Relief/release once bleeding starts',
          details: 'Cramping: Magnesium, heat, gentle movement, and anti-inflammatory foods help. Headaches: Estrogen withdrawal can trigger migraines in susceptible people. Brain fog: Lower hormones can temporarily affect cognitive function. Many people feel emotional or physical relief once bleeding starts, especially if PMS was intense.',
        },
      ],
      keyTakeaways: [
        'Rest is productive — your body is doing important work',
        'Iron-rich and anti-inflammatory foods support recovery',
        'Gentle movement helps, but pushing too hard backfires',
      ],
    },
    Follicular: {
      title: 'Follicular Phase',
      subtitle: 'Inner Spring',
      icon: '🌒',
      color: 'from-indigo-600 to-purple-700',
      cardBg: 'bg-gradient-to-br from-amber-50 to-orange-100',
      days: 'Days 6–13',
      overview: 'Estrogen rises steadily from low to moderate-high levels. FSH causes several ovarian follicles to mature. Rising estrogen increases serotonin, dopamine, and acetylcholine production, improving insulin sensitivity and enhancing neuroplasticity. This is your brain\'s "spring".',
      sections: [
        {
          title: 'How You Might Feel',
          icon: '💭',
          summary: '• Energy rising and rebuilding\n• Optimistic, motivated mood\n• Mental clarity improving\n• Creative and social energy returning\n• Ready to start new projects',
          details: 'Rising estrogen increases serotonin, dopamine, and acetylcholine production. It improves insulin sensitivity, enhances verbal skills and memory, and increases neuroplasticity.',
        },
        {
          title: 'Training & Movement',
          icon: '🏃‍♀️',
          summary: 'This is your power window! Estrogen improves muscle protein synthesis, pain tolerance increases, recovery is faster, and you can handle training volume better.\n\nWhat works well: Heavy strength training, HIIT, plyometrics, learning new skills, increasing training volume.',
          details: 'If you\'re going to add weight, reps, or intensity to your training, this is the phase to do it. Tendon and ligament strength improves.\n\nTCM views this as the Yin-building phase — movement should build strength and vitality. Ayurveda notes Kapha\'s building qualities dominate — your body is strong and can handle more.',
          suggestions: ['Heavy lifts', 'HIIT', 'New PRs', 'Plyometrics', 'Longer cardio'],
        },
        {
          title: 'Nutrition',
          icon: '🥗',
          summary: 'Prioritise: Quality carbohydrates (quinoa, sweet potatoes, oats), lean proteins (chicken, fish, eggs, legumes), fresh vegetables, fermented foods (kimchi, kefir), and cruciferous vegetables.',
          details: 'Insulin sensitivity is high — your body uses carbohydrates efficiently. Metabolic rate is lower compared to luteal phase. Your body is rebuilding after menstruation and digestion is typically strong.\n\nNutrient focus: B vitamins (energy production), zinc (supports follicle development), antioxidants (berries, leafy greens).\n\nTCM recommends building Yin and Blood with lighter cooking methods. Ayurveda suggests Kapha-balancing: light, fresh, not overly heavy.',
          suggestions: ['Quinoa', 'Sweet potatoes', 'Kimchi & kefir', 'Cruciferous veg', 'Lean protein'],
        },
        {
          title: 'Energy & Social',
          icon: '⚡',
          summary: '• Starting new projects or initiatives\n• Social gatherings and networking\n• Creative brainstorming\n• Learning new skills\n• Important conversations\n• Scheduling meetings or presentations',
          details: 'Rising estrogen boosts neurotransmitters associated with motivation, connection, and optimism. Your verbal skills, memory, and social cognition are enhanced. This is your planning and initiation phase — set your intentions and start building momentum.',
        },
        {
          title: 'Meal Timing',
          icon: '🕐',
          summary: '• Your body can handle flexible meal frequency\n• Still listen to hunger cues\n• Good time to experiment with meal timing if curious',
          details: 'High insulin sensitivity means your body efficiently manages glucose. Your metabolism is at its most flexible and your body can switch between fuel sources easily. Many people find fasting feels easier during follicular phase — but "can tolerate" doesn\'t mean "should do".',
        },
        {
          title: 'Common Experiences',
          icon: '📋',
          summary: '• Increased libido\n• Clearer skin\n• Better sleep\n• Heightened senses\n• Optimism bias (may take on too much)\n• Cervical fluid changes',
          details: 'Rising estrogen and testosterone increase sex drive. Estrogen improves skin quality. Taste, smell, and hearing may be enhanced. You may take on too much with the optimism bias — pace yourself. Discharge increases and becomes clearer as ovulation approaches.',
        },
      ],
      keyTakeaways: [
        'This is your power window for training — push for PRs',
        'Rising estrogen boosts mood, energy, and cognitive function',
        'Your body efficiently uses carbohydrates — fuel your workouts',
      ],
    },
    Ovulatory: {
      title: 'Ovulatory Phase',
      subtitle: 'Inner Summer',
      icon: '🌕',
      color: 'from-orange-500 to-orange-700',
      cardBg: 'bg-gradient-to-br from-orange-100 to-red-100',
      days: 'Days 14–16',
      overview: 'Estrogen peaks, LH surges triggering ovulation, and testosterone rises. Peak estrogen enhances communication centres in the brain, increases dopamine and serotonin, and heightens emotional attunement. You\'re biologically primed for connection and performance.',
      sections: [
        {
          title: 'How You Might Feel',
          icon: '💭',
          summary: '• Peak energy and confidence\n• Maximum social and communication skills\n• Heightened senses and awareness\n• Strong, capable, charismatic\n• Elevated mood and libido',
          details: 'Peak estrogen enhances communication centres in the brain, increases dopamine and serotonin, and heightens emotional attunement. Testosterone increases strength and assertiveness.',
        },
        {
          title: 'Training & Movement',
          icon: '🏃‍♀️',
          summary: 'Peak performance window! Maximum pain tolerance, peak strength and power output, highest testosterone of your entire cycle, optimal coordination and reaction time.\n\nGo for: Maximum effort workouts, HIIT, heavy compound lifts, competitive sports, testing your limits.',
          details: 'If you\'re going to do something that scares you physically, this is the time. Your body can handle it.\n\nTCM sees peak Yang energy — vigorous movement is appropriate. Ayurveda notes Pitta dominance — you have heat, intensity, and drive. Channel it into strong practice but don\'t overheat.\n\nWorkouts that felt hard during menstruation feel easy now.',
          suggestions: ['Max effort workouts', 'HIIT & Tabata', 'Heavy compound lifts', 'Group fitness', 'Test your limits'],
        },
        {
          title: 'Nutrition',
          icon: '🥗',
          summary: 'Prioritise: Fibre-rich foods (raw vegetables, fruits, whole grains), antioxidants (berries, colourful vegetables), omega-3s (fatty fish, walnuts, flax), cruciferous vegetables, and lighter proteins.',
          details: 'Metabolism is transitioning and starting to rise. Insulin sensitivity remains good. Digestion is strong — your gut can handle variety and estrogen supports gut motility.\n\nNutrient focus: Vitamin C (supports progesterone production), glutathione-rich foods (asparagus, avocado), B vitamins.\n\nTCM recommends cooling foods to balance peak Yang. Ayurveda suggests Pitta-balancing: cooling, sweet, bitter — coconut, cilantro, cucumber, mint.',
          suggestions: ['Raw veggies & salads', 'Berries', 'Fatty fish', 'Colourful vegetables', 'Fresh fruits'],
        },
        {
          title: 'Energy & Social',
          icon: '⚡',
          summary: '• Social events and parties\n• Date nights\n• Creative collaboration\n• Networking events or conferences\n• Leading meetings\n• Public speaking',
          details: 'Peak estrogen enhances verbal fluency, emotional intelligence, and social bonding. You\'re at your most charismatic and confident. Schedule high-stakes social or professional events during this window — you\'re naturally persuasive, articulate, and confident.',
        },
        {
          title: 'Meal Timing',
          icon: '🕐',
          summary: '• Intuitive eating works well now\n• Your body will signal clearly when it needs fuel\n• Complete flexibility — do what feels good',
          details: 'Your metabolic flexibility is at its peak. You can eat frequently or less often — your body adapts easily. Hunger cues are clear and easy to honour during this phase. Trust your body.',
        },
        {
          title: 'Common Experiences',
          icon: '📋',
          summary: '• Peak libido\n• Heightened attraction (pheromones!)\n• Clear, stretchy cervical fluid\n• Boundless energy\n• Confidence and social magnetism',
          details: 'Biological drive for connection is highest. You may find others more attractive — and they find you more attractive too (pheromones). Conversations flow easily. Even if you don\'t sleep as much, you feel good and capable of anything.',
        },
      ],
      keyTakeaways: [
        'Peak performance — test your limits and go for PRs',
        'You\'re at your most charismatic and confident',
        'Schedule important social and professional events now',
      ],
    },
    'Early Luteal': {
      title: 'Early Luteal Phase',
      subtitle: 'Inner Early Autumn',
      icon: '🌖',
      color: 'from-purple-600 to-indigo-700',
      cardBg: 'bg-gradient-to-br from-purple-50 to-indigo-100',
      days: 'Days 17–23',
      overview: 'Progesterone begins rising after ovulation and climbs steadily. Estrogen rises again (secondary peak) but stays lower than ovulation. Both hormones are elevated together. Progesterone has a calming, slightly sedating effect and raises body temperature, increasing metabolic rate by 100–300 calories per day.',
      sections: [
        {
          title: 'How You Might Feel',
          icon: '💭',
          summary: '• Energy is still good, just moderated from ovulation peak\n• Productive, task-oriented focus\n• Appetite starts increasing\n• Mood is steady, perhaps more introspective\n• Still capable and functional',
          details: 'Progesterone has a calming, slightly sedating effect — it converts to allopregnanolone, a GABA-like compound. It raises body temperature slightly and increases metabolic rate by 100–300 calories per day. You\'re still riding some estrogen benefits, so this phase can feel quite stable and productive.',
        },
        {
          title: 'Training & Movement',
          icon: '🏃‍♀️',
          summary: 'What works well: Moderate-intensity strength training, pilates or barre classes, swimming, steady-state cardio, power walking or hiking, cycling at moderate pace.\n\nApproach carefully: Very long endurance efforts, back-to-back sessions, training in very hot conditions.',
          details: 'Body temperature rises slightly (progesterone effect). Recovery takes a bit longer than follicular/ovulatory. You may overheat more easily during workouts. Strength maintenance is very doable — not quite peak performance, but still strong.\n\nTCM: Yang is still present but Qi begins to consolidate. The expansive energy of ovulation transitions to a more focused, inward-moving quality. Moderate movement supports smooth Qi flow.\n\nAyurveda: Transitioning from Pitta to Vata. The fire element is cooling, air element increasing. Stay grounded with steady practice.\n\nMany people find workouts still feel good, just not as effortless as follicular phase. This is normal — honour the shift.',
          suggestions: ['Pilates', 'Swimming', 'Moderate strength', 'Steady cardio', 'Hiking'],
        },
        {
          title: 'Nutrition',
          icon: '🥗',
          summary: 'Prioritise: Complex carbohydrates (quinoa, lentils, sweet potatoes, brown rice), protein with meals (salmon, chicken, tempeh, eggs), healthy fats (avocado, nuts, nut butters), magnesium-rich snacks (pumpkin seeds, almonds, dark chocolate), and satisfying complete meals.',
          details: 'Metabolic rate begins rising. Insulin sensitivity starts to decrease slightly. Appetite naturally increases. Your body isn\'t "hungrier for no reason" — your metabolic rate has genuinely increased. Eat more.\n\nNutrient focus: B vitamins (chickpeas, poultry, potatoes, bananas) and magnesium.\n\nTCM: Continue Blood nourishment with bone broth, red dates, dark leafy greens. Begin incorporating more warming foods — root vegetables, cooked grains. Smooth Qi flow with citrus, rose tea, fennel.\n\nAyurveda: Grounding Vata foods become more important — warm, cooked, nourishing. Root vegetables, rice, warming spices, ghee.',
          suggestions: ['Quinoa & lentils', 'Sweet potatoes', 'Salmon', 'Nut butters', 'Pumpkin seeds', 'Dark chocolate'],
        },
        {
          title: 'Energy & Social',
          icon: '⚡',
          summary: '• Completing projects started during follicular phase\n• Detail-oriented work and admin tasks\n• Organising and planning\n• Small gatherings with close friends\n• Home projects and nesting activities\n• Creative work that requires focus',
          details: 'Progesterone\'s calming neurotransmitter effects create a more centred, focused energy. You\'re past the social sparkle of ovulation but still mentally sharp and productive. This is your "finishing" energy — great time to tie up loose ends, organise, and complete tasks that need sustained attention.',
        },
        {
          title: 'Meal Timing',
          icon: '🕐',
          summary: '• Pay close attention to hunger signals\n• Regular meals help stabilise energy\n• Satisfying snacks are appropriate\n• Don\'t push long fasts — your body needs fuel',
          details: 'Insulin sensitivity is slightly lower than follicular/ovulatory. Appetite is increasing. Your body needs more frequent nourishment as metabolic rate rises. If you\'re genuinely hungry, eat.',
        },
        {
          title: 'Common Experiences',
          icon: '📋',
          summary: '• Increased appetite (totally normal — metabolic rate has risen)\n• Slight breast tenderness (progesterone effect)\n• Warmer body temperature\n• Stable mood — the calm before potential PMS\n• Good sleep (progesterone can be sleep-promoting)\n• Shift toward introversion',
          details: 'Progesterone can be sleep-promoting, which is a welcome benefit. Your social battery depletes faster than during the ovulatory phase. The increased appetite is real — your metabolic rate has risen and your body genuinely needs more fuel.',
        },
      ],
      keyTakeaways: [
        'Your metabolic rate increases — honour your hunger',
        'Great time for completing tasks and detail-oriented work',
        'Still strong for moderate training — honour the shift from peak',
      ],
    },
    'Late Luteal': {
      title: 'Late Luteal Phase',
      subtitle: 'Inner Late Autumn',
      icon: '🌗',
      color: 'from-purple-700 to-indigo-800',
      cardBg: 'bg-gradient-to-br from-purple-100 to-indigo-100',
      days: 'Days 24–28',
      overview: 'Progesterone and estrogen both drop sharply in the days before your period. This hormonal crash triggers PMS symptoms. Serotonin and dopamine decrease, and your body is preparing for menstruation.',
      sections: [
        {
          title: 'How You Might Feel',
          icon: '💭',
          summary: '• Energy plummeting\n• Mood swings, irritability, or weepiness\n• Strong cravings (especially carbs and sweets)\n• Bloating and breast tenderness\n• Fatigue and need for rest\n• Low frustration tolerance\n• Desire to withdraw socially',
          details: 'When progesterone and estrogen drop rapidly, so do their calming and mood-boosting effects. Serotonin and dopamine decrease, triggering carb cravings and mood changes. GABA (calming neurotransmitter) is affected. This is a hormonal crash — your feelings are real and valid.',
        },
        {
          title: 'Training & Movement',
          icon: '🏃‍♀️',
          summary: 'What works well: Rest days, walking, gentle restorative yoga, stretching and foam rolling, light pilates or barre.\n\nWhat to avoid: Heavy lifting, long endurance sessions, anything that feels like pushing through.',
          details: 'Hormone withdrawal affects energy profoundly. Motivation decreases (dopamine is lower). Your body genuinely needs rest. Intense training adds stress when your system is already stressed. Recovery capacity is lowest.\n\nTCM: Qi and Blood are turning deeply inward, preparing for menstruation. This is the time for consolidation and rest. Forcing Yang activity depletes reserves.\n\nAyurveda: Vata is high and increasing — you need grounding, warmth, and stillness. Movement should be gentle and supportive, never depleting.\n\nMany people find even a walk can feel like effort. This is normal. Your body is working hard internally. Rest is productive work.',
          suggestions: ['Rest days', 'Walking', 'Yin yoga', 'Stretching', 'Foam rolling'],
        },
        {
          title: 'Nutrition',
          icon: '🥗',
          summary: 'Prioritise: Complex carbohydrates (oatmeal, whole grain bread, sweet potatoes), magnesium (dark chocolate, avocado), calcium, B6 foods (chickpeas, potatoes, bananas), satisfying complete meals, and whatever you\'re craving in moderation.\n\nCRITICAL: Restricting calories during late luteal makes PMS worse.',
          details: 'Metabolic rate is STILL elevated. Serotonin drops sharply, driving intense carb and sweet cravings. Insulin sensitivity is lowest of the entire cycle. You need around 10% extra calories to meet your body\'s increased needs.\n\nTCM: Deeply nourishing Blood foods — bone broth, red meat, dark leafy greens. Warming, grounding foods — slow-cooked stews, root vegetables, warming spices. Smooth Qi to prevent stagnation with ginger, rose, citrus peel. Avoid cold, raw, or processed foods.\n\nAyurveda: Heavy Vata-calming foods — warm milk with ghee and spices, rice pudding, root vegetable curries. Sweet, sour, salty tastes to ground Vata. Cooked, warm, moist, slightly heavy foods.',
          suggestions: ['Oatmeal', 'Dark chocolate', 'Sweet potatoes', 'Chickpeas', 'Warming stews', 'Satisfying meals'],
        },
        {
          title: 'Energy & Social',
          icon: '⚡',
          summary: '• Permission to say NO to social obligations\n• Early bedtimes and naps\n• Quiet, alone time (or only with very safe people)\n• Cozy, comforting activities\n• Letting yourself cry if you need to\n• Minimal stimulation\n• Gentle self-compassion',
          details: 'Plummeting estrogen and progesterone take serotonin, dopamine, and GABA with them. Your stress tolerance drops. Small annoyances feel huge.\n\nReframe PMS: Late luteal phase can reveal what isn\'t working in your life. When your tolerance for BS drops, you see clearly what needs to change. Your emotions aren\'t crazy — they\'re information. Be gentle with yourself.',
        },
        {
          title: 'Meal Timing',
          icon: '🕐',
          summary: '• Eat regularly (every 3–4 hours)\n• Don\'t skip breakfast\n• Stabilise blood sugar with protein + complex carbs\n• Honour all hunger\n• Satisfying snacks are necessary, not indulgent',
          details: 'Insulin sensitivity is lowest. Blood sugar swings are common. Fasting DRAMATICALLY worsens PMS by adding cortisol stress on top of hormone withdrawal. Regular meals and snacks are essential for mood and energy stability.',
        },
        {
          title: 'Common Experiences',
          icon: '📋',
          summary: 'Physical: Bloating, breast tenderness, acne breakouts, digestive changes, headaches or migraines, fatigue and heaviness.\n\nEmotional: Irritability and anger, tearfulness, anxiety or doom feelings, sadness or low mood.',
          details: 'Bloating: Progesterone causes water retention — this is temporary. Acne: Androgens rise slightly as estrogen/progesterone drop. Headaches: Estrogen withdrawal is a common trigger. Irritability: Lower frustration tolerance is biological. Tearfulness: Progesterone withdrawal can trigger crying. Anxiety: Neurotransmitter shifts create this.\n\nWhen PMS is severe: If PMS significantly disrupts your life every cycle (can\'t work, relationships suffer, thoughts of self-harm), talk to a healthcare provider. PMDD (premenstrual dysphoric disorder) is a real medical condition that responds to treatment. You don\'t have to suffer through this.',
        },
      ],
      keyTakeaways: [
        'Rest is productive — your body is working hard internally',
        'Restricting food makes PMS worse — honour your hunger and cravings',
        'PMS emotions are information, not weakness — be gentle with yourself',
      ],
    },
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
      const [todayLog, setTodayLog] = useState({
    sleep: '',
    mood: '',
    energy: '',
    stress: '',
  });
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
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 pb-32" style={{fontFamily: 'Lexend, sans-serif'}}>
        <div className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
              🌙 miriam
            </h1>
            <button 
              onClick={() => setCurrentView('about')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition"
            >
              About
            </button>
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

  // About/Project Information View
  const AboutView = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 pb-32" style={{fontFamily: 'Lexend, sans-serif'}}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
              🌙 miriam
            </h1>
            <button 
              onClick={() => setCurrentView('today')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Main Content */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-indigo-100 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                Your Cycle Guide
              </h2>
              <p className="text-lg text-gray-600 italic">
                Like an older sister with all the tips, tricks, and the science to back it up.
              </p>
            </div>

            <div className="h-px bg-indigo-100"></div>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Miriam helps you understand your body's natural rhythm so you can make kinder, smarter choices about nutrition, training, and how you spend your energy throughout your cycle.
              </p>
              
              <p>
                No shame, just practical guidance on how to work <em>with</em> your cycle rather than against it, so you won't be doubled over when Aunt Flo next comes knocking.
              </p>
            </div>

            <div className="h-px bg-indigo-100"></div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center space-x-2">
                <span className="text-xl">🔒</span>
                <span>A note on privacy</span>
              </h3>
              <p className="text-sm text-indigo-900 leading-relaxed">
                Your data never leaves your device. Your body, your data, your choice. Just remember to use the same device each time as Miriam operates on local device storage only, so your logs live where you left them.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('today')}
            className="w-full bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:from-indigo-800 hover:to-purple-900 transform hover:scale-105 transition-all"
          >
            Back to Today
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-indigo-100 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={() => setCurrentView('today')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Today</span>
              </button>
              <button
                onClick={() => setCurrentView('cycle')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Cycle</span>
              </button>
              <button
                onClick={() => setCurrentView('log')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Log</span>
              </button>
              <button
                onClick={() => { setCurrentView('learn'); setLearnPhase(null); }}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Learn</span>
              </button>
              <button
                onClick={() => setCurrentView('me')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Me</span>
              </button>
            </div>
          </div>
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
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
              🌙 miriam
            </h1>
            <button 
              onClick={() => setCurrentView('about')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition"
            >
              About
            </button>
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
                <span className="text-xs font-medium mt-1">Today</span>
              </button>
              <button 
                onClick={() => setCurrentView('cycle')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Cycle</span>
              </button>
              <button
                onClick={() => setCurrentView('log')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Log</span>
              </button>
              <button
                onClick={() => { setCurrentView('learn'); setLearnPhase(null); }}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Learn</span>
              </button>
              <button
                onClick={() => setCurrentView('me')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-indigo-700 bg-indigo-50"
              >
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
        } else if (cycleDay <= 23) {
          phase = 'early-luteal';
          phaseName = 'Early Luteal';
          phaseColor = 'bg-[#E9D8E6]';
          phaseIcon = '🌖';
        } else {
          phase = 'late-luteal';
          phaseName = 'Late Luteal';
          phaseColor = 'bg-[#D4B5D0]';
          phaseIcon = '🌗';
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
      earlyLuteal: { start: 17, end: 23 },
      lateLuteal: { start: 24, end: userData.profile.averageCycleLength }
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 pb-32" style={{fontFamily: 'Lexend, sans-serif'}}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
              🌙 miriam
            </h1>
            <button 
              onClick={() => setCurrentView('about')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition"
            >
              About
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Phase Color Key - Compact */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-3 text-sm">Cycle Phases</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#8C48AE'}}></div>
                <p className="text-xs text-gray-700">Menstrual (1-{userData.profile.averagePeriodLength})</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#FFDAB9'}}></div>
                <p className="text-xs text-gray-700">Follicular ({userData.profile.averagePeriodLength + 1}-13)</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#E08C34'}}></div>
                <p className="text-xs text-gray-700">Ovulatory (14-16)</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#E9D8E6'}}></div>
                <p className="text-xs text-gray-700">Early Luteal (17-23)</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#D4B5D0'}}></div>
                <p className="text-xs text-gray-700">Late Luteal (24-{userData.profile.averageCycleLength})</p>
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
                  'early-luteal': '#E9D8E6',
                  'late-luteal': '#D4B5D0',
                  'luteal': '#E9D8E6'  // fallback for backward compatibility
                };
                
                const textColor = (day.phase === 'menstrual' || day.phase === 'ovulatory' || day.phase === 'late-luteal') ? '#FFFFFF' : '#1F2937';
                
                return (
                  <div 
                    key={day.cycleDay}
                    style={{
                      backgroundColor: bgColors[day.phase],
                      color: textColor
                    }}
                    className={`
                      rounded-xl p-2 relative min-h-[70px] flex items-center justify-center
                      ${day.isToday ? 'ring-4 ring-orange-400 shadow-xl scale-105' : 'shadow-md'}
                      ${day.isPast ? 'opacity-60' : ''}
                      transition-all
                    `}
                  >
                    {/* Cycle day badge on left */}
                    <div className="absolute left-1 top-1 text-xs font-semibold opacity-70">
                      {day.cycleDay}
                    </div>
                    
                    {/* Main content - date and month */}
                    <div className="text-center">
                      <p className="text-2xl font-bold leading-none">{day.dayNum}</p>
                      <p className="text-xs mt-0.5 opacity-75">{day.monthShort}</p>
                    </div>
                    
                    {day.hasLog && (
                      <div className="absolute top-1.5 right-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                    {day.isToday && (
                      <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        NOW
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
                <span className="text-xs font-medium mt-1">Today</span>
              </button>
              <button
                onClick={() => setCurrentView('cycle')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-indigo-700 bg-indigo-50"
              >
                <span className="text-xs font-semibold mt-1">Cycle</span>
              </button>
              <button
                onClick={() => setCurrentView('log')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Log</span>
              </button>
              <button
                onClick={() => { setCurrentView('learn'); setLearnPhase(null); }}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <span className="text-xs font-medium mt-1">Learn</span>
              </button>
              <button
                onClick={() => setCurrentView('me')}
                className="flex-1 flex flex-col items-center py-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
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
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
              🌙 miriam
            </h1>
            <button 
              onClick={() => setCurrentView('about')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition"
            >
              About
            </button>
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
                  {phaseInfo.phase === 'Early Luteal' && '🌖'}
                  {phaseInfo.phase === 'Late Luteal' && '🌗'}
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
              <GuidanceCard icon="💪" title="Training" category="training" data={guidance.training} />
              <GuidanceCard icon="🥗" title="Nutrition" category="nutrition" data={guidance.nutrition} />
              <GuidanceCard icon="⚡" title="Energy & Social" category="energy" data={guidance.energy} />
              <GuidanceCard icon="⏰" title="Meal Times" category="fasting" data={guidance.fasting} />
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
                <span className="text-xs font-semibold mt-1">Today</span>
              </button>
              <button 
                onClick={() => setCurrentView('cycle')}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${currentView === 'cycle' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                <span className="text-xs font-medium mt-1">Cycle</span>
              </button>
              <button
                onClick={() => setCurrentView('log')}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${currentView === 'log' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                <span className="text-xs font-medium mt-1">Log</span>
              </button>
              <button
                onClick={() => { setCurrentView('learn'); setLearnPhase(null); }}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${currentView === 'learn' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                <span className="text-xs font-medium mt-1">Learn</span>
              </button>
              <button
                onClick={() => setCurrentView('me')}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${currentView === 'me' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                <span className="text-xs font-medium mt-1">Me</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Bottom Nav component shared across Learn views
  const BottomNav = ({ active }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-indigo-100 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => setCurrentView('today')}
            className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${active === 'today' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            <span className={`text-xs ${active === 'today' ? 'font-semibold' : 'font-medium'} mt-1`}>Today</span>
          </button>
          <button
            onClick={() => setCurrentView('cycle')}
            className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${active === 'cycle' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            <span className={`text-xs ${active === 'cycle' ? 'font-semibold' : 'font-medium'} mt-1`}>Cycle</span>
          </button>
          <button
            onClick={() => setCurrentView('log')}
            className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${active === 'log' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            <span className={`text-xs ${active === 'log' ? 'font-semibold' : 'font-medium'} mt-1`}>Log</span>
          </button>
          <button
            onClick={() => { setCurrentView('learn'); setLearnPhase(null); }}
            className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${active === 'learn' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            <span className={`text-xs ${active === 'learn' ? 'font-semibold' : 'font-medium'} mt-1`}>Learn</span>
          </button>
          <button
            onClick={() => setCurrentView('me')}
            className={`flex-1 flex flex-col items-center py-2 rounded-lg transition ${active === 'me' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            <span className={`text-xs ${active === 'me' ? 'font-semibold' : 'font-medium'} mt-1`}>Me</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Learn landing page
  const LearnView = () => {
    const phases = ['Menstrual', 'Follicular', 'Ovulatory', 'Early Luteal', 'Late Luteal'];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 pb-28" style={{fontFamily: 'Lexend, sans-serif'}}>
        <div className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
              🌙 miriam
            </h1>
            <button
              onClick={() => setCurrentView('about')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition"
            >
              About
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">Learn</h2>
            <p className="text-gray-600">Understand your cycle, phase by phase</p>
          </div>

          <div className="space-y-4">
            {phases.map((phaseName) => {
              const guide = phaseGuides[phaseName];
              return (
                <button
                  key={phaseName}
                  onClick={() => setLearnPhase(phaseName)}
                  className={`w-full ${guide.cardBg} rounded-3xl p-6 shadow-lg border border-indigo-100 text-left hover:shadow-xl transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <span className="text-4xl">{guide.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-indigo-900">{guide.title}</h3>
                        <p className="text-sm text-indigo-600 font-medium">{guide.subtitle}</p>
                        <p className="text-xs text-gray-500 mt-1">{guide.days}</p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{guide.overview.slice(0, 100)}...</p>
                      </div>
                    </div>
                    <span className="text-indigo-400 text-xl ml-2">›</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <BottomNav active="learn" />
      </div>
    );
  };

  // Phase guide detail page
  const PhaseGuideView = () => {
    const [expandedSections, setExpandedSections] = useState([]);
    const guide = phaseGuides[learnPhase];

    if (!guide) return null;

    const toggleSection = (index) => {
      setExpandedSections((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 pb-28" style={{fontFamily: 'Lexend, sans-serif'}}>
        <div className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setLearnPhase(null)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition flex items-center space-x-1"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentView('about')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition"
            >
              About
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Hero card */}
          <div className={`bg-gradient-to-r ${guide.color} rounded-3xl p-8 text-white shadow-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{guide.days}</p>
                <h2 className="text-3xl font-bold mt-1">{guide.title}</h2>
                <p className="text-white/90 mt-1 text-lg">{guide.subtitle}</p>
              </div>
              <span className="text-6xl">{guide.icon}</span>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 mb-3">Overview</h3>
            <p className="text-gray-700 leading-relaxed">{guide.overview}</p>
          </div>

          {/* Sections */}
          {guide.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-lg border border-indigo-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h4 className="text-lg font-bold text-indigo-900">{section.title}</h4>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.summary}</p>

                <button
                  onClick={() => toggleSection(index)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-4 flex items-center space-x-1"
                >
                  <span>{expandedSections.includes(index) ? '▲' : '▼'}</span>
                  <span>{expandedSections.includes(index) ? 'Show less' : 'Learn more'}</span>
                </button>

                {expandedSections.includes(index) && (
                  <div className="mt-4 bg-indigo-50 rounded-xl p-4 space-y-3 border border-indigo-100">
                    <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-line">{section.details}</p>
                    {section.suggestions && section.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-indigo-900 mb-2">Try:</p>
                        <div className="flex flex-wrap gap-2">
                          {section.suggestions.map((suggestion, idx) => (
                            <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl text-sm border border-indigo-200">
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
          ))}

          {/* Key Takeaways */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-lg border border-indigo-200">
            <h3 className="text-lg font-bold text-indigo-900 mb-4">Key Takeaways</h3>
            <ul className="space-y-3">
              {guide.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span className="text-indigo-900">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <BottomNav active="learn" />
      </div>
    );
  };

  if (!userData) {
    if (currentStep === 0) return <OnboardingWelcome />;
    if (currentStep === 1) return <OnboardingPeriodStart />;
    if (currentStep === 2) return <OnboardingPeriodEnd />;
    if (currentStep === 3) return <OnboardingCycleLength />;
  }

  if (currentView === 'about') return <AboutView />;
  if (currentView === 'log') return <LogView />;
  if (currentView === 'cycle') return <CycleView />;
  if (currentView === 'learn') {
    if (learnPhase) return <PhaseGuideView />;
    return <LearnView />;
  }
  if (currentView === 'me') return <MeView />;
  if (currentView === 'today') return <TodayView />;
  
  return <TodayView />;
};

export default CycleApp;
