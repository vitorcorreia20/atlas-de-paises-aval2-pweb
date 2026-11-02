export interface CountrySummary {
  code: string;
  name: string;
  continent: string;
}

export interface CountryIndicator {
  name: string;
  value: string;
  year: string;
}

export interface CountryDetail {
  code: string;
  name: string;
  continent: string;
  subRegion: string;
  capital: string;
  areaKm2: number;
  population: number | null;
  demographicDensity: number | null;
  indicators: CountryIndicator[];
}

export type TravelStatus = 'want_to_visit' | 'visited';

export interface TravelItem {
  id: number;
  country_code: string;
  name: string;
  status: TravelStatus;
  note: string | null;
  created_at: string;
}

export interface ApiErrorResponse {
  error: string;
}
