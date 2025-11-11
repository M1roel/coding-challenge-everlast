import '../styles/LeadCard.css';
import React, { useState } from 'react';

const calculateScore = (
    budget: number,
    companySize: number,
    industry: string,
    timeframe: string
) => {
    let score = 0;

    score += budget === 5000 ? 10 : budget === 30000 ? 20 : budget === 50000 ? 30 : 0;

    score += companySize === 50 ? 10 : companySize === 300 ? 20 : companySize === 500 ? 30 : 0;

    score += industry === 'tech' ? 20 : industry === 'finance' ? 15 : industry === 'healthcare' ? 10 : industry === 'other' ? 5 : 0;

    score += timeframe === 'immediately' ? 20 : timeframe === 'this_week' ? 15 : timeframe === 'this_month' ? 10 : timeframe === 'later' ? 5 : 0;

    return score;
};

const LeadCard = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [companySize, setCompanySize] = useState<number | ''>('');
    const [budget, setBudget] = useState<number | ''>('');
    const [industry, setIndustry] = useState('');
    const [timeframe, setTimeframe] = useState('');
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');

    const updateScore = (b = budget, c = companySize, i = industry, t = timeframe) => {
        const budgetNum = typeof b === 'number' ? b : 0;
        const companySizeNum = typeof c === 'number' ? c : 0;
        setScore(calculateScore(budgetNum, companySizeNum, i, t));
    };

    const getProgressColor = (score: number) => {
        if (score <= 10) return '#660000';
        if (score <= 20) return '#993333';
        if (score <= 30) return '#996633';
        if (score <= 40) return '#999933';
        if (score <= 50) return '#669900';
        if (score <= 60) return '#66cc33';
        if (score <= 70) return '#33cc33';
        if (score <= 80) return '#33cc66';
        if (score <= 90) return '#33ff99';
        return '#00cc66';
    };

    const saveLead = async () => {
        if (!firstName || !lastName || !email || !company) {
            setMessage('Bitte alle Pflichtfelder ausfüllen.');
            return;
        }

        const budgetNumber = budget ? Number(budget) : null;
        const companySizeNumber = companySize ? Number(companySize) : null;

        const payload = {
            first_name: firstName,
            last_name: lastName,
            email,
            company,
            budget: budgetNumber,
            company_size: companySizeNumber,
            industry,
            urgency: timeframe,
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/leads/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': '1',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Hier bekommst du die genauen Feldfehler
                console.error('Backend Validation Errors:', errorData);
                alert('Speichern fehlgeschlagen:\n' + JSON.stringify(errorData, null, 2));
                return;
            }

            setMessage('Lead erfolgreich gespeichert!');
            setFirstName('');
            setLastName('');
            setEmail('');
            setCompany('');
            setBudget('');
            setCompanySize('');
            setIndustry('');
            setTimeframe('');
            setScore(0);
        } catch (error) {
            setMessage('Speichern fehlgeschlagen: ' + error);
        }
    };

    return (
        <div className="lead-card">
            <h2 className="lead-card-title"> ➕ Neuen Kunden hinzufügen</h2>
            <input
                type="text"
                className="lead-card-input"
                placeholder="Vorname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <input
                type="text"
                className="lead-card-input"
                placeholder="Nachname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            <input
                type="email"
                className="lead-card-input"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="text"
                className="lead-card-input"
                placeholder="Firmenname"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
            />
            <select
                className="lead-card-select"
                value={budget}
                onChange={(e) => {
                    setBudget(Number(e.target.value));
                    updateScore(Number(e.target.value));
                }}
            >
                <option value="">Budget auswählen</option>
                <option value={5000}>Unter 10.000 €</option>
                <option value={30000}>10.000 € - 49.999 €</option>
                <option value={50000}>Über 50.000 €</option>
            </select>

            <select
                className="lead-card-select"
                value={companySize}
                onChange={(e) => {
                    setCompanySize(Number(e.target.value));
                    updateScore(undefined, Number(e.target.value));
                }}
            >
                <option value="">Unternehmensgröße auswählen</option>
                <option value={50}>1-99 Mitarbeiter</option>
                <option value={300}>100-499 Mitarbeiter</option>
                <option value={500}>500+ Mitarbeiter</option>
            </select>

            <select
                className="lead-card-select"
                value={industry}
                onChange={(e) => {
                    setIndustry(e.target.value);
                    updateScore(undefined, undefined, e.target.value);
                }}
            >
                <option value="">Branche auswählen</option>
                <option value="tech">Technologie</option>
                <option value="healthcare">Gesundheitswesen</option>
                <option value="finance">Finanzen</option>
                <option value="other">Andere</option>
            </select>

            <select
                className="lead-card-select"
                value={timeframe}
                onChange={(e) => {
                    setTimeframe(e.target.value);
                    updateScore(undefined, undefined, undefined, e.target.value);
                }}
            >
                <option value="">Zeitrahmen auswählen</option>
                <option value="immediately">Sofort</option>
                <option value="this_week">Diese Woche</option>
                <option value="this_month">Dieser Monat</option>
                <option value="later">Später</option>
            </select>
            <div className="lead-card-progress-wrapper">
                <div
                    className="lead-card-progress-bar"
                    style={{
                        width: `${score}%`,
                        backgroundColor: getProgressColor(score),
                    }}
                ></div>
            </div>
            <label className="lead-card-progress-label">Score: {score}%</label>
            <button className="lead-card-button" onClick={saveLead}>Speichern</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default LeadCard;