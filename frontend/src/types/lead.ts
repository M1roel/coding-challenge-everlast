/**
 * Represents a sales lead with scoring information
 */
export interface Lead {
  id: number
  first_name: string
  last_name: string
  email: string
  company: string
  company_size?: string
  budget?: string
  industry?: string
  urgency?: string
  score: number
  created_at?: string
  updated_at?: string
  tenant?: number
}

/**
 * Aggregated statistics for leads
 * 
 * @note Currently unused - prepared for future dashboard/analytics features
 */
export interface LeadStats {
  total_leads: number
  avg_score: number
  high_score_leads: number
}
