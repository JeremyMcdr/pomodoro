import React, { useState, useEffect } from 'react';
import { Bell, Clock, Coffee, ArrowRight, ArrowLeft, Check, Play, X } from 'lucide-react';

const App = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isWork, setIsWork] = useState(true);
  const [cycles, setCycles] = useState(0);
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [nextPhaseInfo, setNextPhaseInfo] = useState(null);

  const steps = [
    {
      title: "Temps de travail",
      icon: Clock,
      description: "Définissez votre durée de concentration",
      state: workDuration,
      setState: setWorkDuration,
      color: "bg-blue-500"
    },
    {
      title: "Pause courte",
      icon: Coffee,
      description: "Définissez la durée de vos pauses régulières",
      state: shortBreakDuration,
      setState: setShortBreakDuration,
      color: "bg-green-500"
    },
    {
      title: "Pause longue",
      icon: Bell,
      description: "Définissez la durée de votre pause prolongée",
      state: longBreakDuration,
      setState: setLongBreakDuration,
      color: "bg-purple-500"
    },
    {
      title: "Récapitulatif",
      icon: Check,
      description: "Vérifiez vos paramètres",
      color: "bg-indigo-500"
    }
  ];

  // Fonction pour jouer le son
  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3'); // Vous devrez ajouter ce fichier dans le dossier public
    audio.play().catch(error => {
      console.log('Erreur lors de la lecture du son:', error);
    });
  };

  // Fonction pour gérer la fin d'une phase
  const handlePhaseEnd = () => {
    setIsActive(false);
    const nextPhase = isWork 
      ? (cycles > 0 && cycles % 4 === 0 ? "pause longue" : "pause courte")
      : "travail";
    
    setNextPhaseInfo({
      type: nextPhase,
      duration: nextPhase === "travail" 
        ? workDuration 
        : nextPhase === "pause longue" 
          ? longBreakDuration 
          : shortBreakDuration
    });
    
    setShowPhaseModal(true);
    playNotificationSound(); // Jouer le son
  };

  // Fonction pour confirmer le changement de phase
  const confirmPhaseChange = () => {
    if (nextPhaseInfo.type === "travail") {
      setMinutes(workDuration);
      setIsWork(true);
      if (!isLongBreak) {
        setCycles(c => c + 1);
      }
      setIsLongBreak(false);
    } else {
      setMinutes(nextPhaseInfo.type === "pause longue" ? longBreakDuration : shortBreakDuration);
      setIsWork(false);
      setIsLongBreak(nextPhaseInfo.type === "pause longue");
    }
    setSeconds(0);
    setIsActive(true);
    setShowPhaseModal(false);
  };

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handlePhaseEnd();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  // Modal de confirmation de phase
  const PhaseChangeModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full mx-4 modal-animation">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            {isWork ? "Bravo !" : "C'est reparti !"}
          </h3>
          <button 
            onClick={() => setShowPhaseModal(false)}
            className="text-gray-400 hover:text-white transition-colors duration-300"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-8">
          <p className="text-gray-300 mb-6">
            {isWork 
              ? "Prenez une pause bien méritée." 
              : "La pause est terminée. Prêt à reprendre le travail ?"}
          </p>
          <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <p className="text-gray-400 text-sm mb-2">Prochaine phase :</p>
            <p className="text-xl font-bold text-white mb-1">
              {nextPhaseInfo?.type.charAt(0).toUpperCase() + nextPhaseInfo?.type.slice(1)}
            </p>
            <p className="text-violet-400">
              Durée : {nextPhaseInfo?.duration} minutes
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowPhaseModal(false)}
            className="px-6 py-3 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
          >
            Annuler
          </button>
          <button
            onClick={confirmPhaseChange}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium hover:from-violet-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-violet-500/25"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );

  // Demander la permission pour les notifications
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isConfigured) {
      setMinutes(workDuration);
      setSeconds(0);
      setIsActive(true);
    }
  }, [isConfigured, workDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(workDuration);
    setSeconds(0);
    setIsWork(true);
    setCycles(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsConfigured(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetToConfig = () => {
    setIsConfigured(false);
    setIsActive(false);
    setSeconds(0);
    setCycles(0);
    setCurrentStep(0);
    setIsWork(true);
  };

  const renderStepContent = () => {
    if (!isConfigured) {
      return (
        <div className="max-w-md mx-auto">
          {/* Stepper */}
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep ? step.color : 'bg-gray-200'
                } text-white transition-all duration-300`}>
                  <step.icon size={20} />
                </div>
                <div className="h-1 w-full mt-2">
                  <div className={`h-full ${
                    index <= currentStep ? step.color : 'bg-gray-200'
                  } transition-all duration-300`} />
                </div>
              </div>
            ))}
          </div>

          {/* Contenu de l'étape */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>

            {currentStep < 3 ? (
              <div className="space-y-4">
                <div className="relative mt-8">
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={steps[currentStep].state}
                    onChange={(e) => steps[currentStep].setState(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <span className="text-3xl font-bold">{steps[currentStep].state}</span>
                    <span className="text-gray-600 ml-2">min</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Temps de travail</span>
                  <span className="font-bold">{workDuration} min</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Pause courte</span>
                  <span className="font-bold">{shortBreakDuration} min</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Pause longue</span>
                  <span className="font-bold">{longBreakDuration} min</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              className={`flex items-center px-6 py-3 rounded-lg ${
                currentStep === 0 ? 'invisible' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft size={20} className="mr-2" />
              Retour
            </button>
            <button
              onClick={handleNext}
              className={`flex items-center px-6 py-3 rounded-lg text-white ${steps[currentStep].color} hover:opacity-90`}
            >
              {currentStep === steps.length - 1 ? 'Commencer' : 'Suivant'}
              {currentStep === steps.length - 1 ? <Play size={20} className="ml-2" /> : <ArrowRight size={20} className="ml-2" />}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-8 shadow-lg w-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {isWork ? "Phase de Travail" : isLongBreak ? "Pause Longue" : "Pause Courte"}
          </h1>

          <div className="text-6xl font-bold mb-8">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          
          <div className="flex justify-center space-x-4 mb-6">
            <button 
              onClick={toggleTimer}
              className={`px-6 py-3 rounded-lg text-white ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              } transition-colors duration-200`}
            >
              {isActive ? 'Pause' : 'Démarrer'}
            </button>
            <button 
              onClick={resetTimer}
              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
            >
              Réinitialiser
            </button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-6">
            <Bell size={16} />
            <span className="text-sm">
              Cycles complétés : {cycles}
            </span>
          </div>

          <button 
            onClick={resetToConfig}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
          >
            <ArrowLeft size={16} className="mr-1" />
            Retour à la configuration
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-[#13111C] to-[#1F1B2E]">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full mx-auto relative overflow-hidden">
        {/* Effet de brillance */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-500/10 to-transparent rotate-45 transform scale-150" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            Pomodoro Timer
          </h1>

          {isConfigured ? (
            <div className="space-y-8">
              {/* Timer display */}
              <div className="text-center">
                <div className="text-7xl font-bold mb-4 text-white glow-effect">
                  {String(minutes).padStart(2, '0')}
                  <span className="text-violet-400">:</span>
                  {String(seconds).padStart(2, '0')}
                </div>
                
                <div className="flex justify-center gap-4 mt-8">
                  <button 
                    onClick={toggleTimer}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium hover:from-violet-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-violet-500/25"
                  >
                    {isActive ? 'Pause' : 'Démarrer'}
                  </button>
                  <button 
                    onClick={resetTimer}
                    className="px-8 py-3 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-2 text-violet-300">
                <Bell size={18} className="opacity-75" />
                <span>Cycles complétés : {cycles}</span>
              </div>

              {/* Bouton de retour à la configuration */}
              <button 
                onClick={resetToConfig}
                className="flex items-center justify-center gap-2 text-violet-300 hover:text-violet-200 transition-colors duration-300 mt-4"
              >
                <ArrowLeft size={18} />
                <span>Configuration</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Configuration steps */}
              <div className="flex justify-between mb-12">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      index <= currentStep 
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-500' 
                        : 'bg-white/5'
                    } transition-all duration-300`}>
                      <step.icon size={24} className="text-white" />
                    </div>
                    <div className="mt-2 text-sm text-violet-300">
                      {step.title}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time selection */}
              {currentStep === 3 ? (
                // Récapitulatif
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-xl text-violet-300 mb-6">Récapitulatif de vos paramètres</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Clock size={20} className="text-violet-400" />
                        <span className="text-gray-300">Temps de travail</span>
                      </div>
                      <span className="text-white font-bold">{workDuration} min</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Coffee size={20} className="text-violet-400" />
                        <span className="text-gray-300">Pause courte</span>
                      </div>
                      <span className="text-white font-bold">{shortBreakDuration} min</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Bell size={20} className="text-violet-400" />
                        <span className="text-gray-300">Pause longue</span>
                      </div>
                      <span className="text-white font-bold">{longBreakDuration} min</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Affichage du slider pour les autres étapes
                <div className="space-y-8">
                  <div className="text-center">
                    <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                      {steps[currentStep].state}
                    </span>
                    <span className="text-2xl text-violet-300 ml-2">min</span>
                  </div>

                  <div className="relative mt-12">
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={steps[currentStep].state}
                      onChange={(e) => steps[currentStep].setState(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between px-2 mt-2">
                      <span className="text-sm text-violet-300">1</span>
                      <span className="text-sm text-violet-300">30</span>
                      <span className="text-sm text-violet-300">60</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="flex justify-between mt-12">
                <button
                  onClick={handleBack}
                  className={`p-4 rounded-2xl ${
                    currentStep === 0 
                      ? 'opacity-0 cursor-default' 
                      : 'bg-white/5 hover:bg-white/10'
                  } text-white transition-all duration-300`}
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-violet-500/25 flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Commencer
                      <Play size={20} />
                    </>
                  ) : (
                    <>
                      Suivant
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showPhaseModal && <PhaseChangeModal />}
    </div>
  );
};

export default App;