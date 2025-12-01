import { useEffect, useState } from "react";

// eslint-disable @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default function CvAnalysisResult({ analysis, loading, error }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (analysis) setStep(0); // Reset on new analysis
    }, [analysis]);

    return (
        <div className="p-8 text-gray-800 dark:text-white">
            {!analysis && !loading && (
                <p className="text-base opacity-70">
                    Select a CV from the left to start the analysis.
                </p>
            )}

            {loading && (
                <p className="text-lg font-medium">Analyzing CV... please wait.</p>
            )}

            {analysis && (
                <>
                    <ScoreCard score={analysis.score} />

                    {step >= 0 && (
                        <AnimatedSection
                            title="Overall Feedback"
                            text={analysis.overallFeedback}
                            onDone={() => setStep(1)}
                        />
                    )}

                    {step >= 1 && (
                        <ListSection
                            title="Weaknesses"
                            items={analysis.weaknesses}
                            onDone={() => setStep(2)}
                        />
                    )}

                    {step >= 2 && (
                        <ListSection
                            title="Improvements"
                            items={analysis.improvements}
                            onDone={() => setStep(3)}
                        />
                    )}

                    {step >= 3 && (
                        <ListSection
                            title="Missing Sections"
                            items={analysis.missingSections}
                            onDone={() => setStep(4)}
                        />
                    )}

                    {step >= 4 && (
                        <ListSection
                            title="Mistakes"
                            items={analysis.mistakes}
                            onDone={() => setStep(5)}
                        />
                    )}
                </>
            )}

            {error && (
                <p className="text-red-600 dark:text-red-400 mt-3">
                    An error occurred while analyzing the CV: {error}
                </p>
            )}
        </div>
    );
}

function ScoreCard({ score }: { score: number }) {
    const scoreColor = getScoreColor(score);
    const percentage = Math.min(Math.max(score, 0), 100);
    const angle = (percentage / 100) * 360;

    return (
        <div className="flex flex-row justify-start items-center mb-8 gap-12">
            {/* Animated Circle - 120px */}
            <div
                className="w-[120px] h-[120px] rounded-full flex justify-center items-center transition-all duration-1000 relative"
                style={{
                    background: `conic-gradient(${scoreColor} ${angle}deg, #e5e7eb ${angle}deg)`,
                    boxShadow: score > 90 ? `0 0 20px ${scoreColor}` : "none",
                }}
            >
                <div className="w-[100px] h-[100px] rounded-full bg-white dark:bg-gray-800 flex flex-col justify-center items-center">
                    <span
                        className="text-[42px] font-bold leading-9"
                        style={{ color: scoreColor }}
                    >
                        {score}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">/100</span>
                </div>
            </div>

            <div>
                <h2
                    className="text-xl font-semibold"
                    style={{ color: scoreColor }}
                >
                    Resume Score
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Overall performance rating
                </p>
            </div>
        </div>
    );
}


function getScoreColor(score: number): string {
    if (score < 40) return "#e74c3c";      // red
    if (score < 70) return "#f1c40f";      // yellow
    return "#27ae60";                      // green
}

function useTypewriter(text: string, speed = 45, onDone?: () => void) {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        let frame: number;
        const start = performance.now();

        setDisplayed("");

        const animate = (time: number) => {
            const elapsed = time - start;
            const charsToShow = Math.floor(elapsed / speed);

            if (charsToShow <= text.length) {
                setDisplayed(text.slice(0, charsToShow));
            }

            if (charsToShow < text.length) {
                frame = requestAnimationFrame(animate);
            } else {
                if (onDone) onDone();
            }
        };

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [text]);

    return displayed;
}

function AnimatedSection({
                             title,
                             text,
                             onDone
                         }: {
    title: string;
    text: string;
    onDone: () => void
}) {
    const displayed = useTypewriter(text, 30, onDone);

    return (
        <div className="mt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="mb-1.5 text-xl font-semibold text-gray-800 dark:text-white">
                {title}
            </h3>
            <p className="whitespace-pre-wrap leading-relaxed text-base text-gray-700 dark:text-gray-300">
                {displayed}
            </p>
        </div>
    );
}

function AnimatedListItem({
                              text,
                              onDone
                          }: {
    text: string;
    onDone: () => void
}) {
    const displayed = useTypewriter(text, 30, onDone);
    return <span className="text-gray-700 dark:text-gray-300">{displayed}</span>;
}

function ListSection({
                         title,
                         items,
                         onDone
                     }: {
    title: string;
    items: string[];
    onDone?: () => void
}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex === items.length && onDone) {
            onDone();
        }
    }, [currentIndex, items.length, onDone]);

    if (!items || items.length === 0) return null;

    return (
        <div className="mt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="mb-1.5 text-xl font-semibold text-gray-800 dark:text-white">
                {title}
            </h3>

            <ul className="list-none p-0 mt-2">
                {items.slice(0, currentIndex + 1).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 mb-2.5 leading-normal">
                        <span className="w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                        <AnimatedListItem
                            text={item}
                            onDone={() => setCurrentIndex(prev => prev + 1)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
