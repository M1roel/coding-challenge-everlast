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

export interface LeadStats {
  total_leads: number
  avg_score: number
  high_score_leads: number
}
