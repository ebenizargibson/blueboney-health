// The shapes /health/labs and /health/imaging return, and the one question every
// screen must ask of a result before showing it: is it pending?
//
// A pending result is redacted by the backend to id, order_id, patient_id and
// test_name plus `pending_review: true`. It looks the same whether a clinician is
// still reviewing it or has held it to deliver in person, and so must every
// screen: "Awaiting review", with no value, no date and no interpretation.

export interface PendingResult {
  id:             string
  order_id:       string
  test_name?:     string
  pending_review: true
}

export interface ReleasedLabResult {
  id:               string
  order_id:         string
  test_name:        string
  value:            string
  unit?:            string | null
  reference_range?: string | null
  interpretation?:  string | null
  note?:            string | null
  is_critical?:     boolean
  resulted_at?:     string | null
  pending_review?:  undefined
}

export type LabResult = ReleasedLabResult | PendingResult

export interface LabOrder {
  id:                  string
  status:              string
  tests?:              { name?: string; code?: string }[] | null
  ordered_at:          string
  /** Absent while any result on the order is pending. */
  resulted_at?:        string | null
  lab?:                { name?: string } | null
  health_lab_results?: LabResult[] | null
}

export interface ReleasedImagingReport {
  id:              string
  findings?:       string | null
  impression?:     string | null
  reported_at?:    string | null
  report_pdf_url?: string | null
  pending_review?: undefined
}

export type ImagingReport = ReleasedImagingReport | PendingResult

export interface ImagingOrder {
  id:                      string
  modality?:               string | null
  body_part?:              string | null
  status:                  string
  ordered_at:              string
  scheduled_at?:           string | null
  imaging_provider?:       { name?: string } | null
  health_imaging_reports?: ImagingReport[] | null
}

export function isPending(r: LabResult | ImagingReport): r is PendingResult {
  return r.pending_review === true
}

/** What was ordered, from the order's own test list. */
export function labOrderTitle(o: LabOrder): string {
  const names = (o.tests ?? []).map(t => t.name).filter((n): n is string => !!n)
  return names.length > 0 ? names.join(', ') : 'Lab order'
}

export const AWAITING_REVIEW = 'Awaiting review'
