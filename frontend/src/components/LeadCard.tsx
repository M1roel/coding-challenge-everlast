import '../styles/LeadCard.css';

const LeadCard = () => {
  return (
    <div className="lead-card">
      <h2 className="lead-card-title">Lead Title</h2>
      <p className="lead-card-description">This is a brief description of the lead.</p>
      <button className="lead-card-button">View Details</button>
    </div>
  );
};

export default LeadCard;