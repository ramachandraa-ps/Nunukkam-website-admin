import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CardItem {
    title: string;
    subtitle: string;
    count?: string;
    subCount?: string;
    link?: string;
    icon: string;
    color: string;
    path: string;
}

interface ActionCardsProps {
    cards: CardItem[];
}

const ActionCards: React.FC<ActionCardsProps> = ({ cards }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    onClick={() => navigate(card.path)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{card.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${card.color} bg-opacity-50`}>
                            <span className="material-symbols-outlined">{card.icon}</span>
                        </div>
                    </div>
                    <div className="mt-6 flex items-baseline gap-2">
                        {card.count && <span className="text-3xl font-bold text-gray-900 dark:text-white">{card.count}</span>}
                        {card.subCount && <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-gray-100 text-gray-600`}>{card.subCount}</span>}
                        {card.link && <span className="text-primary-600 font-semibold text-sm group-hover:underline">{card.link}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActionCards;
