import '../styles/LeadTable.css';
import React from 'react';
import type { Lead } from '../types/lead';

interface LeadTableProps {
    leads: Lead[];
}

/**
 * Table component for displaying a list of leads
 * 
 * Renders leads in a sortable table with visual indicators for high-scoring leads.
 * High-scoring leads (score >= 70) are highlighted with a special style.
 * 
 * @component
 * @param {LeadTableProps} props - Component props
 * @returns {JSX.Element} Rendered table or empty state message
 * 
 * @example
 * ```tsx
 * <LeadTable leads={leadsData} />
 * ```
 */
const LeadTable: React.FC<LeadTableProps> = ({ leads }) => {
    if (leads.length === 0) {
        return (
            <div className="no-data">
                <p>Keine Leads vorhanden</p>
            </div>
        );
    }

    return (
        <table className="lead-table">
            <thead>
                <tr>
                    <th>Vorname</th>
                    <th>Nachname</th>
                    <th>E-Mail</th>
                    <th>Firma</th>
                    <th>Punktzahl</th>
                </tr>
            </thead>
            <tbody>
                {leads.map((lead) => (
                    <tr key={lead.id} className={lead.score >= 70 ? 'high-score' : ''}>
                        <td>{lead.first_name}</td>
                        <td>{lead.last_name}</td>
                        <td>{lead.email}</td>
                        <td>{lead.company}</td>
                        <td>
                            <span className={`score score-${Math.floor(lead.score / 10) * 10}`}>
                                {lead.score}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default LeadTable;   