import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

interface Question {
  id: number;
  type: 'multiple-choice' | 'true-false-notgiven' | 'matching' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  userAnswer?: string | number;
  passage: number;
}

interface Passage {
  id: number;
  title: string;
  content: string;
  questions: number[];
}

const IELTSReadingTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showPassage, setShowPassage] = useState(true);
  const [currentPassage, setCurrentPassage] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  const passages: Passage[] = [
    {
      id: 1,
      title: 'The History of Chocolate',
      content: `Chocolate has a rich history that spans over 3,000 years. The ancient Maya and Aztec civilizations were among the first to cultivate cacao beans, which they used to create a bitter drink called "xocolatl." This beverage was reserved for nobility and warriors, and was often used in religious ceremonies.

The Spanish conquistadors brought cacao to Europe in the 16th century, where it underwent significant transformation. Sugar was added to counteract the natural bitterness, making it more palatable to European tastes. By the 17th century, chocolate houses had become popular gathering places for the elite in London and other major European cities.

The Industrial Revolution marked a turning point in chocolate production. In 1828, Dutch chemist Coenraad van Houten invented a machine that could separate cocoa butter from cacao beans, creating cocoa powder. This innovation made chocolate cheaper to produce and more accessible to the general public.

The 19th century saw further innovations, including the development of milk chocolate by Daniel Peter in Switzerland in 1875. Henri Nestlé had previously developed powdered milk, which Peter combined with chocolate to create the first milk chocolate bar. This period also witnessed the establishment of major chocolate companies that remain household names today.

Modern chocolate production involves several stages: harvesting cacao beans, fermenting and drying them, roasting and grinding to create cocoa liquor, and finally processing into various chocolate products. Today, chocolate is a global industry worth billions of dollars, with consumers worldwide enjoying everything from artisanal truffles to mass-produced candy bars.`,
      questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    },
    {
      id: 2,
      title: 'Urban Wildlife Conservation',
      content: `As cities continue to expand worldwide, the relationship between urban development and wildlife conservation has become increasingly complex. Traditional approaches to conservation often focused on preserving pristine wilderness areas, but growing urbanization has forced conservationists to reconsider their strategies.

Urban environments present unique challenges for wildlife. Habitat fragmentation, pollution, noise, and human disturbance can significantly impact animal populations. However, cities also offer unexpected opportunities for certain species to thrive. Some animals have adapted remarkably well to urban conditions, sometimes achieving higher population densities in cities than in their natural habitats.

Green corridors and urban parks play crucial roles in supporting urban wildlife. These spaces provide essential resources such as food, water, and nesting sites. Research has shown that even small patches of green space can support surprisingly diverse communities of plants and animals. The design and management of these areas can significantly influence their effectiveness as wildlife habitat.

Citizen science has emerged as a powerful tool in urban wildlife research and conservation. Projects that engage the public in collecting data about urban wildlife populations have generated valuable insights while raising awareness about conservation issues. Mobile apps and online platforms have made it easier than ever for city residents to contribute to scientific research.

The future of urban wildlife conservation lies in creating more wildlife-friendly cities through thoughtful planning and design. This includes incorporating green infrastructure, reducing light pollution, creating wildlife corridors, and fostering public support for conservation initiatives. Success requires collaboration between urban planners, conservation biologists, and local communities.`,
      questions: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
    },
    {
      id: 3,
      title: 'The Future of Renewable Energy',
      content: `The global transition to renewable energy sources represents one of the most significant technological and economic shifts of the 21st century. As concerns about climate change intensify and fossil fuel reserves dwindle, nations worldwide are investing heavily in solar, wind, hydroelectric, and other renewable technologies.

Solar energy has experienced remarkable growth in recent years, with costs dropping dramatically due to technological improvements and economies of scale. Photovoltaic panels have become increasingly efficient, while innovations in energy storage are addressing the intermittency challenges that have historically limited solar power adoption.

Wind energy, both onshore and offshore, has similarly seen rapid expansion. Modern wind turbines are larger and more efficient than their predecessors, capable of generating electricity even in low-wind conditions. Offshore wind farms, in particular, offer enormous potential due to stronger and more consistent winds at sea.

The integration of renewable energy sources into existing power grids presents both opportunities and challenges. Smart grid technologies are being developed to manage the variable nature of renewable energy production, automatically balancing supply and demand across different energy sources. Energy storage solutions, including battery technology and pumped hydro storage, are crucial for maintaining grid stability.

Despite significant progress, several barriers remain to widespread renewable energy adoption. These include initial capital costs, regulatory hurdles, and the need for substantial infrastructure investments. However, many experts believe that renewable energy will become increasingly cost-competitive with fossil fuels, making the transition economically inevitable.`,
      questions: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
    }
  ];

  const questions: Question[] = [
    // Passage 1 Questions
    {
      id: 1,
      passage: 1,
      type: 'multiple-choice',
      question: 'According to the passage, the ancient Maya and Aztec civilizations used cacao beans to create:',
      options: ['A sweet drink for children', 'A bitter drink called "xocolatl"', 'Medicine for the sick', 'Food for animals']
    },
    {
      id: 2,
      passage: 1,
      type: 'true-false-notgiven',
      question: 'The Spanish conquistadors immediately added sugar to chocolate when they brought it to Europe.',
      options: ['True', 'False', 'Not Given']
    },
    {
      id: 3,
      passage: 1,
      type: 'fill-blank',
      question: 'In 1828, Dutch chemist _______ invented a machine that could separate cocoa butter from cacao beans.'
    },
    // Add more questions...
    {
      id: 4,
      passage: 1,
      type: 'multiple-choice',
      question: 'According to the passage, milk chocolate was first developed in:',
      options: ['England in 1850', 'Switzerland in 1875', 'Holland in 1828', 'Spain in the 16th century']
    },
    {
      id: 5,
      passage: 1,
      type: 'true-false-notgiven',
      question: 'Henri Nestlé invented milk chocolate.',
      options: ['True', 'False', 'Not Given']
    },
    // Passage 2 Questions
    {
      id: 14,
      passage: 2,
      type: 'multiple-choice',
      question: 'Traditional conservation approaches focused primarily on:',
      options: ['Urban development', 'Preserving wilderness areas', 'Building green corridors', 'Citizen science projects']
    },
    {
      id: 15,
      passage: 2,
      type: 'true-false-notgiven',
      question: 'Some animals achieve higher population densities in cities than in natural habitats.',
      options: ['True', 'False', 'Not Given']
    },
    // Passage 3 Questions
    {
      id: 27,
      passage: 3,
      type: 'multiple-choice',
      question: 'According to the passage, solar energy costs have dropped due to:',
      options: ['Government subsidies only', 'Technological improvements and economies of scale', 'Reduced demand', 'Lower material costs only']
    },
    {
      id: 28,
      passage: 3,
      type: 'true-false-notgiven',
      question: 'Offshore wind farms produce more energy than onshore wind farms.',
      options: ['True', 'False', 'Not Given']
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit test
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      const nextQ = questions[currentQuestion + 1];
      if (nextQ.passage !== currentPassage + 1) {
        setCurrentPassage(nextQ.passage - 1);
      }
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevQ = questions[currentQuestion - 1];
      if (prevQ.passage !== currentPassage + 1) {
        setCurrentPassage(prevQ.passage - 1);
      }
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IELTS Academic Reading Test</h1>
                <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Answered</p>
                <p className="text-lg font-bold text-green-600">{answeredCount}/{questions.length}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p className="text-lg font-bold text-red-600">{formatTime(timeRemaining)}</p>
              </div>
              
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Passage Panel */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Passage {currentPassage + 1}: {passages[currentPassage].title}
                </h2>
                <button
                  onClick={() => setShowPassage(!showPassage)}
                  className="lg:hidden bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                >
                  {showPassage ? 'Hide' : 'Show'} Passage
                </button>
              </div>
            </div>
            
            <div className={`p-6 h-96 overflow-y-auto ${!showPassage ? 'hidden lg:block' : ''}`}>
              <div className="prose prose-sm max-w-none">
                {passages[currentPassage].content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Question Panel */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Question {currentQuestion + 1}
                </h3>
                <button
                  onClick={() => toggleFlag(currentQuestionData.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    flaggedQuestions.has(currentQuestionData.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Flag className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-900 font-medium mb-4">
                  {currentQuestionData.question}
                </p>

                {/* Multiple Choice */}
                {currentQuestionData.type === 'multiple-choice' && currentQuestionData.options && (
                  <div className="space-y-3">
                    {currentQuestionData.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionData.id}`}
                          value={index}
                          checked={answers[currentQuestionData.id] === index}
                          onChange={(e) => handleAnswer(currentQuestionData.id, parseInt(e.target.value))}
                          className="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True/False/Not Given */}
                {currentQuestionData.type === 'true-false-notgiven' && currentQuestionData.options && (
                  <div className="space-y-3">
                    {currentQuestionData.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionData.id}`}
                          value={index}
                          checked={answers[currentQuestionData.id] === index}
                          onChange={(e) => handleAnswer(currentQuestionData.id, parseInt(e.target.value))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Fill in the Blank */}
                {currentQuestionData.type === 'fill-blank' && (
                  <input
                    type="text"
                    placeholder="Type your answer here..."
                    value={answers[currentQuestionData.id] || ''}
                    onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {answers[currentQuestionData.id] !== undefined && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {flaggedQuestions.has(currentQuestionData.id) && (
                    <Flag className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <button
                  onClick={nextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question Overview */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Question Overview</h3>
          
          <div className="grid grid-cols-10 md:grid-cols-20 gap-2">
            {questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined;
              const isFlagged = flaggedQuestions.has(question.id);
              const isCurrent = index === currentQuestion;
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm relative transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                  {isFlagged && (
                    <Flag className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span className="text-gray-600">Not answered</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">Flagged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IELTSReadingTest;
