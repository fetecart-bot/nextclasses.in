import { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, AlertCircle, Bookmark, ChevronLeft, ChevronRight, Award, FileText, Download, RotateCcw, Sparkles } from 'lucide-react';
import { MOCK_TESTS_DATA } from '../data/mockTestsData';
import { MockTest, MockTestResult } from '../types';

interface InteractiveMockTestModalProps {
  onClose: () => void;
  initialTestId?: string;
  onSaveResult?: (result: MockTestResult) => void;
  onOpenStudentPortal?: () => void;
}

export default function InteractiveMockTestModal({
  onClose,
  initialTestId,
  onSaveResult,
  onOpenStudentPortal,
}: InteractiveMockTestModalProps) {
  const [selectedTestId, setSelectedTestId] = useState<string>(
    initialTestId || MOCK_TESTS_DATA[0].id
  );
  const currentTest: MockTest =
    MOCK_TESTS_DATA.find((t) => t.id === selectedTestId) || MOCK_TESTS_DATA[0];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(currentTest.durationMinutes * 60);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<MockTestResult | null>(null);

  // Timer loop
  useEffect(() => {
    if (isTestSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestSubmitted, selectedAnswers]);

  // Reset test state if test changes
  const handleSelectTest = (testId: string) => {
    const test = MOCK_TESTS_DATA.find((t) => t.id === testId) || MOCK_TESTS_DATA[0];
    setSelectedTestId(testId);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setMarkedForReview({});
    setSecondsRemaining(test.durationMinutes * 60);
    setIsTestSubmitted(false);
    setTestResult(null);
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isTestSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleToggleReview = (questionId: number) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleClearResponse = (questionId: number) => {
    if (isTestSubmitted) return;
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleSubmitTest = () => {
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    currentTest.questions.forEach((q) => {
      const studentAns = selectedAnswers[q.id];
      if (studentAns === undefined) {
        unattempted++;
      } else if (studentAns === q.correctOptionIndex) {
        correct++;
        score += currentTest.positiveMarks;
      } else {
        incorrect++;
        score -= currentTest.negativeMarks;
      }
    });

    const attempted = correct + incorrect;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const scoreFraction = Math.max(0, score) / currentTest.totalMarks;
    const percentile = Math.min(99.9, Math.max(50, Math.round((scoreFraction * 45 + 54) * 10) / 10));

    const result: MockTestResult = {
      testId: currentTest.id,
      testTitle: currentTest.title,
      score: Math.max(0, score),
      totalMarks: currentTest.totalMarks,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattempted,
      accuracyPercentage: accuracy,
      percentileEstimate: percentile,
      timeTakenSeconds: currentTest.durationMinutes * 60 - secondsRemaining,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTestResult(result);
    setIsTestSubmitted(true);
    if (onSaveResult) {
      onSaveResult(result);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQ = currentTest.questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div
      id="interactive-mock-test-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-2xl bg-neutral-950 border border-neutral-800 text-white shadow-2xl overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0">
              CBT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{currentTest.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {currentTest.category === 'competitive' ? 'Official NTA Pattern' : 'AI Platform Benchmark'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Total Marks: {currentTest.totalMarks} • +{currentTest.positiveMarks} Correct / -{currentTest.negativeMarks} Incorrect
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Clock */}
            <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 ${
              secondsRemaining < 120
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-neutral-950 border-neutral-700 text-amber-300'
            }`}>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTestSubmitted ? 'Completed' : formatTimer(secondsRemaining)}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close test"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Test Selector Tabs */}
        <div className="px-5 py-2 bg-neutral-900/50 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-neutral-500 font-medium text-[11px] uppercase tracking-wider shrink-0">Switch Paper:</span>
          {MOCK_TESTS_DATA.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTest(t.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedTestId === t.id
                  ? 'bg-orange-500 text-neutral-950 font-bold'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {t.examCode} Sprint
            </button>
          ))}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!isTestSubmitted ? (
            /* Live Test View */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Left 3 Cols: Active Question Workspace */}
              <div className="lg:col-span-3 space-y-4">
                {/* Question Info Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      Question {currentQuestionIndex + 1} of {currentTest.questions.length}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400">{currentQ.subject}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300">
                      {currentQ.topic}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleReview(currentQ.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      markedForReview[currentQ.id]
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-600'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>
                </div>

                {/* Question Text */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                  <p className="text-sm sm:text-base text-neutral-100 font-medium leading-relaxed">
                    {currentQ.questionText}
                  </p>

                  {currentQ.codeSnippet && (
                    <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs text-orange-300 overflow-x-auto">
                      {currentQ.codeSnippet}
                    </pre>
                  )}
                </div>

                {/* Answer Options */}
                <div className="space-y-2.5">
                  {currentQ.options.map((option, oIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, oIdx)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500/10 border-orange-500 text-white shadow-sm shadow-orange-500/10'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-orange-500 text-neutral-950'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => handleClearResponse(currentQ.id)}
                    disabled={selectedAnswers[currentQ.id] === undefined}
                    className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    Clear Response
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-white disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    {currentQuestionIndex < currentTest.questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitTest}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-95 cursor-pointer shadow-md shadow-orange-500/20"
                      >
                        Submit Test Now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Col: Question Palette */}
              <div className="space-y-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Question Palette</h4>
                  <p className="text-[11px] text-neutral-400">Click any box to jump directly:</p>
                </div>

                {/* Grid of numbers */}
                <div className="grid grid-cols-5 gap-2">
                  {currentTest.questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isReview = markedForReview[q.id];
                    const isCurrent = currentQuestionIndex === idx;

                    let colorClass = 'bg-neutral-800 text-neutral-300 border-neutral-700';
                    if (isCurrent) {
                      colorClass = 'ring-2 ring-white ' + (isAnswered ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-neutral-950');
                    } else if (isReview) {
                      colorClass = 'bg-purple-900/80 text-purple-200 border-purple-600';
                    } else if (isAnswered) {
                      colorClass = 'bg-emerald-600/90 text-white border-emerald-500';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-9 rounded-lg text-xs font-bold border transition-transform hover:scale-105 cursor-pointer ${colorClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="pt-3 border-t border-neutral-800 space-y-1.5 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-900 border border-purple-500 shrink-0" />
                    <span>Marked for Review ({Object.values(markedForReview).filter(Boolean).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-neutral-800 shrink-0" />
                    <span>Unattempted ({currentTest.questions.length - answeredCount})</span>
                  </div>
                </div>

                {/* Submit button inside palette */}
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="w-full mt-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Finish & Submit Test
                </button>
              </div>

            </div>
          ) : (
            /* Test Result & Detailed Solution View */
            testResult && (
              <div className="space-y-6">
                
                {/* Scorecard Hero Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-orange-500/30 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 mx-auto flex items-center justify-center text-neutral-950 font-black shadow-lg">
                    <Award className="w-8 h-8 text-neutral-950" />
                  </div>

                  <div>
                    <span className="text-xs uppercase font-bold tracking-widest text-orange-400">
                      Diagnostic Performance Analysis
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {testResult.testTitle}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">Submitted at {testResult.submittedAt}</p>
                  </div>

                  {/* High Level Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block">Total Score</span>
                      <span className="text-2xl font-black text-amber-400">
                        {testResult.score} <span className="text-xs text-neutral-500">/ {testResult.totalMarks}</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block">Accuracy</span>
                      <span className="text-2xl font-black text-emerald-400">
                        {testResult.accuracyPercentage}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block">Estimated Percentile</span>
                      <span className="text-2xl font-black text-orange-400">
                        {testResult.percentileEstimate} %ile
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block">Correct / Attempted</span>
                      <span className="text-2xl font-black text-white">
                        {testResult.correctAnswers} <span className="text-xs text-neutral-500">/ {testResult.correctAnswers + testResult.incorrectAnswers}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTest(currentTest.id)}
                      className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Mock Test</span>
                    </button>

                    <a
                      href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(testResult, null, 2))}`}
                      download={`${currentTest.examCode}_MockTest_Result.json`}
                      className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Solution Report</span>
                    </a>
                  </div>
                </div>

                {/* Question-by-Question Solution Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span>Line-by-Line Answer Explanations & Error Analysis</span>
                    </h3>
                    <span className="text-xs text-neutral-400">
                      NCERT & Standard Academic Verified
                    </span>
                  </div>

                  <div className="space-y-4">
                    {currentTest.questions.map((q, idx) => {
                      const studentAnswer = selectedAnswers[q.id];
                      const isCorrect = studentAnswer === q.correctOptionIndex;
                      const isUnattempted = studentAnswer === undefined;

                      return (
                        <div
                          key={q.id}
                          className={`p-4 sm:p-5 rounded-xl border text-left space-y-3 ${
                            isCorrect
                              ? 'bg-neutral-900/80 border-emerald-500/30'
                              : isUnattempted
                              ? 'bg-neutral-900/60 border-neutral-800'
                              : 'bg-neutral-900/80 border-rose-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">
                              Question {idx + 1} • {q.subject}
                            </span>
                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                                  +{currentTest.positiveMarks} Correct
                                </span>
                              ) : isUnattempted ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400">
                                  Unattempted (0 Marks)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                                  -{currentTest.negativeMarks} Negative
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed">
                            {q.questionText}
                          </p>

                          {/* Options Review */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {q.options.map((opt, oIdx) => {
                              const isStudentPick = studentAnswer === oIdx;
                              const isCorrectOption = q.correctOptionIndex === oIdx;

                              let optBorder = 'border-neutral-800 bg-neutral-950 text-neutral-400';
                              if (isCorrectOption) {
                                optBorder = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold';
                              } else if (isStudentPick && !isCorrectOption) {
                                optBorder = 'border-rose-500 bg-rose-950/40 text-rose-300';
                              }

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2.5 rounded-lg border flex items-center justify-between ${optBorder}`}
                                >
                                  <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                  {isCorrectOption && (
                                    <span className="text-[10px] text-emerald-400 font-bold ml-2">Correct</span>
                                  )}
                                  {isStudentPick && !isCorrectOption && (
                                    <span className="text-[10px] text-rose-400 font-bold ml-2">Your Answer</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation Box */}
                          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300 space-y-1">
                            <span className="text-orange-400 font-bold text-[11px] block flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>NCERT / Core Conceptual Reason:</span>
                            </span>
                            <p className="text-neutral-400 leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Weekly mock test scores are saved automatically to your NextClass Student Profile.</span>
          <div className="flex items-center gap-2">
            {onOpenStudentPortal && testResult && (
              <button
                type="button"
                onClick={onOpenStudentPortal}
                className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold text-xs hover:bg-orange-500/30 cursor-pointer"
              >
                View in Student Portal
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
