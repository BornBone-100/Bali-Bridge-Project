import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export type DDReportRow = {
  id: string;
  property_id: number;
  target_roi: number;
  investment_period: string | null;
  land_rights: string | null;
  legal_status: {
    sertifikat?: string;
    zoning?: string;
    pbg?: string;
    [key: string]: unknown;
  } | null;
  location_data: {
    beach_min?: number;
    hospital_min?: number;
    airport_min?: number;
    [key: string]: unknown;
  } | null;
  financial_data: Record<string, unknown> | null;
  pdf_url: string | null;
  updated_at: string;
};

export function useDDReport(propertyId: string | number) {
  const [report, setReport] = useState<DDReportRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDDReport() {
      if (propertyId === undefined || propertyId === null || String(propertyId).trim() === '') {
        setReport(null);
        setError('invalid_property_id');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const normalizedPropertyId = Number(propertyId);
      if (!Number.isFinite(normalizedPropertyId)) {
        setReport(null);
        setError('invalid_property_id');
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('dd_reports')
          .select('*')
          .eq('property_id', normalizedPropertyId)
          .maybeSingle();

        if (queryError) throw queryError;
        setReport((data as DDReportRow | null) ?? null);
      } catch (e) {
        console.error('DD report fetch error:', e);
        setReport(null);
        setError('fetch_failed');
      } finally {
        setLoading(false);
      }
    }

    void fetchDDReport();
  }, [propertyId]);

  return { report, loading, error };
}
