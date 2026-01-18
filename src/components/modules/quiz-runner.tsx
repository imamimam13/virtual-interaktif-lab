"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Timer, XCircle, CheckCircle, ArrowRight, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Question {
    question: string;
    options: string[];
    answer: number; // Index of correct answer
}

interface QuizRunnerProps {
    questions: Question[];
    onComplete: (score: number) => void;
    compact?: boolean;
    finishLabel?: string;
}

export default function QuizRunner({ questions, onComplete, compact = false, finishLabel = "See Results" }: QuizRunnerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];

    // Timer Logic
    useEffect(() => {
        if (!isAnswered && !isFinished && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isAnswered) {
            handleAnswer(-1); // Time out
        }
    }, [timeLeft, isAnswered, isFinished]);

    const handleAnswer = (optionIndex: number) => {
        if (isAnswered) return;

        setIsAnswered(true);
        setSelectedOption(optionIndex);

        const isCorrect = optionIndex === currentQuestion.answer;
        if (isCorrect) {
            setScore((prev) => prev + 100 + (timeLeft * 2) + (streak * 10));
            setStreak((prev) => prev + 1);
            // Confetti
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
            });
        } else {
            setStreak(0);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setIsAnswered(false);
            setSelectedOption(null);
            setTimeLeft(30);
        } else {
            setIsFinished(true);
            onComplete(score);
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 }
            });
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setStreak(0);
        setTimeLeft(30);
        setIsAnswered(false);
        setSelectedOption(null);
        setIsFinished(false);
    }

    if (isFinished) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[500px] text-center ${compact ? 'p-4' : 'p-8'} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-2xl`}>
                <Trophy className={`${compact ? 'h-16 w-16' : 'h-32 w-32'} text-yellow-300 mb-6 drop-shadow-lg animate-bounce`} />
                <h2 className={`${compact ? 'text-2xl' : 'text-4xl'} font-bold mb-2`}>Quiz Completed!</h2>
                <p className={`${compact ? 'text-lg' : 'text-xl'} opacity-90 mb-8`}>Your amazing score:</p>
                <div className={`${compact ? 'text-4xl px-4 py-2' : 'text-6xl px-8 py-4'} font-black bg-white/20 rounded-xl backdrop-blur-md mb-8`}>
                    {score}
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleRetry} size="lg" variant="secondary" className="font-bold text-lg">
                        <RefreshCcw className="mr-2 h-5 w-5" /> Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-3xl mx-auto space-y-6 ${compact ? 'space-y-4' : ''}`}>
            {/* Header Stats */}
            {!compact && (
                <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                            <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Score</p>
                            <p className="font-bold text-xl">{score}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-sm font-semibold mb-1">Question {currentQuestionIndex + 1}/{questions.length}</div>
                        <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <span role="img" aria-label="fire">🔥</span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Streak</p>
                            <p className="font-bold text-xl">{streak}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Header for Embedded Mode */}
            {compact && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Q: {currentQuestionIndex + 1}/{questions.length}</span>
                    <span>Score: {score}</span>
                </div>
            )}

            {/* Question Card */}
            <div className="relative">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={`bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden border-2 border-primary/5 ${compact ? 'border-0 shadow-sm' : ''}`}
                >
                    {/* Timer Bar */}
                    <div className="h-2 bg-gray-100">
                        <motion.div
                            className="h-full bg-purple-500"
                            initial={{ width: "100%" }}
                            animate={{ width: isAnswered ? `${(timeLeft / 30) * 100}%` : "0%" }}
                            transition={{ duration: isAnswered ? 0 : 30, ease: "linear" }}
                        />
                    </div>

                    <div className={`${compact ? 'p-4 min-h-[100px]' : 'p-8 min-h-[200px]'} text-center flex items-center justify-center flex-col`}>
                        <div className={`mb-4 flex items-center justify-center ${compact ? 'h-10 w-10 text-sm' : 'h-16 w-16 text-xl'} rounded-full bg-purple-100 text-purple-600 font-bold`}>
                            {timeLeft}s
                        </div>
                        <h2 className={`${compact ? 'text-lg' : 'text-2xl md:text-3xl'} font-bold text-slate-800 dark:text-slate-100 leading-relaxed`}>
                            {currentQuestion?.question}
                        </h2>
                    </div>

                    {/* Options Grid */}
                    <div className={`grid ${compact ? 'grid-cols-1 gap-2 p-2' : 'grid-cols-1 md:grid-cols-2 gap-4 p-6'} bg-gray-50 dark:bg-zinc-900/50`}>
                        {currentQuestion?.options.map((option, idx) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === currentQuestion.answer;
                            const showResult = isAnswered;

                            let cardStyle = "border-2 hover:brightness-95 active:scale-[0.98]";
                            let bgStyle = "bg-white dark:bg-zinc-800";

                            // Kahoot Colors
                            const colors = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
                            const baseColor = colors[idx % 4];

                            if (showResult) {
                                if (isCorrect) bgStyle = "bg-green-500 text-white border-green-600 ring-4 ring-green-200";
                                else if (isSelected && !isCorrect) bgStyle = "bg-red-500 text-white border-red-600 opacity-50";
                                else bgStyle = "bg-gray-200 opacity-50 grayscale";
                            } else {
                                bgStyle = `${baseColor} text-white border-transparent`;
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={isAnswered}
                                    className={`
                                        relative ${compact ? 'p-3 text-sm' : 'p-6 text-lg'} rounded-xl text-left transition-all duration-200 font-bold shadow-md
                                        flex items-center justify-between
                                        ${cardStyle} ${bgStyle}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`${compact ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm'} rounded-full bg-black/20 flex items-center justify-center`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                    {showResult && isCorrect && <CheckCircle className="h-6 w-6" />}
                                    {showResult && isSelected && !isCorrect && <XCircle className="h-6 w-6" />}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Next Button */}
            <AnimatePresence>
                {isAnswered && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                    >
                        <Button onClick={handleNext} size="lg" className="w-full md:w-auto text-lg py-6 shadow-xl bg-slate-900 hover:bg-slate-800">
                            {currentQuestionIndex < questions.length - 1 ? "Next Question" : finishLabel} <ArrowRight className="ml-2" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
