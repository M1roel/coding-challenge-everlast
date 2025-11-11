import '../styles/LeadCard.css';
import React, { useState } from 'react';

const calculateScore = (budget: string, companySize: string, industry: string, timeframe: string) => {
  let score = 0;

  if (budget === 'low') score += 10;
  else if (budget === 'medium') score += 20;
  else if (budget === 'high') score += 30;

  if (companySize === 'small') score += 10;
  else if (companySize === 'medium') score += 20;
  else if (companySize === 'large') score += 30;

  if (industry === 'tech') score += 20;
  else if (industry === 'finance') score += 15;
  else if (industry === 'healthcare') score += 10;
  else score += 5;

  if (timeframe === 'immediately') score += 20;
  else if (timeframe === 'this_week') score += 15;
  else if (timeframe === 'this_month') score += 10;
  else if (timeframe === 'later') score += 5;

  return score;
};

const LeadCard = () => {
  const [budget, setBudget] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [score, setScore] = useState(0);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBudget = e.target.value;
    setBudget(newBudget);
    const newScore = calculateScore(newBudget, companySize, industry, timeframe);
    setScore(newScore);
  };

  const handleCompanySizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompanySize = e.target.value;
    setCompanySize(newCompanySize);
    const newScore = calculateScore(budget, newCompanySize, industry, timeframe);
    setScore(newScore);
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndustry = e.target.value;
    setIndustry(newIndustry);
    const newScore = calculateScore(budget, companySize, newIndustry, timeframe);
    setScore(newScore);
  };

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeframe = e.target.value;
    setTimeframe(newTimeframe);
    const newScore = calculateScore(budget, companySize, industry, newTimeframe);
    setScore(newScore);
  };

  return (
    <div className="lead-card">
      <h2 className="lead-card-title"> ➕ Neuen Kunden hinzufügen</h2>
      <input type="text" className="lead-card-input" placeholder="Kundenname" />
      <input type="email" className="lead-card-input" placeholder="E-Mail" />
      <input type="text" className="lead-card-input" placeholder="Firmenname" />
      <select className="lead-card-select" onChange={handleBudgetChange}>
        <option value="">Budget auswählen</option>
        <option value="low">Unter 10.000 €</option>
        <option value="medium">10.000 € - 49.999 €</option>
        <option value="high">Über 50.000 €</option>
      </select>
      <select className="lead-card-select" onChange={handleCompanySizeChange}>
        <option value="">Unternehmensgröße auswählen</option>
        <option value="small">1-99 Mitarbeiter</option>
        <option value="medium">100-499 Mitarbeiter</option>
        <option value="large">500+ Mitarbeiter</option>
      </select>
      <select className="lead-card-select" onChange={handleIndustryChange}>
        <option value="">Branche auswählen</option>
        <option value="tech">Technologie</option>
        <option value="healthcare">Gesundheitswesen</option>
        <option value="finance">Finanzen</option>
        <option value="other">Andere</option>
      </select>
      <select className="lead-card-select" onChange={handleTimeframeChange}>
        <option value="">Zeitrahmen auswählen</option>
        <option value="immediately">Sofort</option>
        <option value="this_week">Diese Woche</option>
        <option value="this_month">Dieser Monat</option>
        <option value="later">Später</option>
      </select>
      <progress className="lead-card-progress" value={score} max="100"></progress>
      <label className="lead-card-progress-label">Score: {score}%</label>
      <button className="lead-card-button">Speichern</button>
    </div>
  );
};

export default LeadCard;