"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, Trophy, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_QUIZ } from "@/lib/mock-data";

export default function QuizPlayer() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const question = MOCK_QUIZ.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / MOCK_QUIZ.questions.length) * 100;

    const handleOptionClick = (optionId: string) => {
        if (isAnswered) return;
        setSelectedOption(optionId);
        setIsAnswered(true);

        if (optionId === question.correctAnswer) {
            setScore(score + 100);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex + 1 < MOCK_QUIZ.questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <Trophy className="h-24 w-24 text-yellow-500 mb-4" />
                <h2 className="text-4xl font-bold">Quiz Complete!</h2>
                <p className="text-2xl text-muted-foreground">Your Score: {score}</p>
                <Button onClick={() => window.location.reload()} size="lg">Try Again</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header Info */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-primary">{MOCK_QUIZ.title}</h2>
                    <p className="text-muted-foreground">Question {currentQuestionIndex + 1} / {MOCK_QUIZ.questions.length}</p>
                </div>
                <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full font-mono font-bold">
                    <Timer className="h-4 w-4" />
                    <span>00:30</span> {/* Static timer for mockup */}
                </div>
            </div>

            <Progress value={progress} className="h-2" />

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-8 min-h-[200px] flex items-center justify-center bg-white dark:bg-zinc-900 shadow-lg border-2 border-primary/10">
                        <h1 className="text-2xl md:text-3xl font-medium text-center leading-relaxed">
                            {question.text}
                        </h1>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, idx) => {
                    // Determine colors based on state
                    const isSelected = selectedOption === option.id;
                    const isCorrect = option.id === question.correctAnswer;

                    let cardColor = "hover:border-primary/50 cursor-pointer"; // Default

                    if (isAnswered) {
                        if (isSelected && isCorrect) cardColor = "bg-green-100 border-green-500 dark:bg-green-900/30";
                        else if (isSelected && !isCorrect) cardColor = "bg-red-100 border-red-500 dark:bg-red-900/30";
                        else if (!isSelected && isCorrect) cardColor = "bg-green-50 border-green-300 dark:bg-green-900/10 opacity-70";
                        else cardColor = "opacity-50 grayscale";
                    } else {
                        // Add "Kahoot" style colors for unselected
                        const colors = [
                            "border-l-4 border-l-red-500",
                            "border-l-4 border-l-blue-500",
                            "border-l-4 border-l-yellow-500",
                            "border-l-4 border-l-green-500"
                        ];
                        cardColor += ` ${colors[idx % 4]}`;
                    }

                    return (
                        <Card
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            className={cn(
                                "p-6 flex items-center justify-between transition-all duration-200 border-2",
                                cardColor,
                                isSelected && "ring-2 ring-primary ring-offset-2"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center font-bold text-white",
                                    ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"][idx % 4]
                                )}>
                                    {["▲", "◆", "●", "■"][idx]}
                                </div>
                                <span className="font-medium text-lg">{option.text}</span>
                            </div>
                            {isAnswered && isSelected && (
                                isCorrect ? <CheckCircle className="text-green-600 h-6 w-6" /> : <XCircle className="text-red-600 h-6 w-6" />
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Next Button */}
            {isAnswered && (
                <div className="flex justify-end animate-in slide-in-from-bottom-4">
                    <Button size="lg" onClick={nextQuestion} className="text-lg px-8">
                        Next Question <ArrowRight className="ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
}
