export interface AddressDto {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  full_address?: string;
}

export interface LocationPointDto {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: AddressDto;
}

export interface DeliveryStopDto extends LocationPointDto {
  priority: 'REGULAR' | 'HIGH' | 'CRITICAL';
  fixed_order?: number | null;
  demand?: number;
  service_duration_minutes?: number | null;
  target_arrival_time?: string | null;
  is_suggestion?: boolean;
  suggestion_category?: 'FARMACIA' | 'PRODUTOS_NATURAIS' | null;
  detour_distance_km?: number | null;
  detour_time_minutes?: number | null;
}

export interface CityInsightDto {
  city: string;
  state: string;
  ibge_code?: string;
  population: number;
  city_tier: 'METROPOLIS' | 'REGIONAL_HUB' | 'MEDIUM_CITY' | 'SMALL_TOWN';
  city_tier_label: string;
  demographic_density_hab_km2?: number;
  gdp_per_capita_brl?: number;
  regional_hub_name?: string;
  commercial_potential_summary?: string;
  confirmed_stops_count: number;
  suggested_leads_count: number;
  estimated_dwell_minutes: number;
}

export interface SuggestedStopDto {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: AddressDto;
  suggestion_category: 'FARMACIA' | 'PRODUTOS_NATURAIS';
  category_label?: string;
  detour_distance_km?: number;
  detour_time_minutes?: number;
  nearest_stop_id?: string;
  nearest_stop_name?: string;
  is_suggestion: boolean;
}

export interface OptimizeRouteRequest {
  depot: LocationPointDto;
  stops: DeliveryStopDto[];
  return_to_depot?: boolean;
  departure_time?: string;
  default_service_minutes?: number;
  discover_suggestions?: boolean;
  max_suggestions?: number;
  excluded_locations?: LocationPointDto[];
}

export interface OrderedStopDto {
  step: number;
  id: string;
  name: string;
  action: 'DEPARTURE' | 'VISIT' | 'RETURN';
  is_fixed: boolean;
  fixed_order?: number | null;
  priority: string;
  arrival_time_minutes: number;
  lat?: number;
  lon?: number;
  address?: AddressDto;
  estimated_arrival_clock?: string;
  estimated_departure_clock?: string;
  service_duration_minutes?: number;
  traffic_factor?: number;
  traffic_condition?: string;
  target_arrival_time?: string | null;
  has_time_conflict?: boolean;
  time_conflict_message?: string | null;
  is_suggestion?: boolean;
  suggestion_category?: 'FARMACIA' | 'PRODUTOS_NATURAIS' | null;
  detour_distance_km?: number | null;
  detour_time_minutes?: number | null;
}

export interface OptimizeRouteResponse {
  total_time_minutes: number;
  total_distance_km: number;
  stops_count: number;
  ordered_stops: OrderedStopDto[];
  geojson_geometry: any;
  fitness_history: number[];
  departure_clock?: string;
  estimated_finish_clock?: string;
  total_transit_minutes?: number;
  total_service_minutes?: number;
  peak_hours_encountered?: number;
  has_any_time_conflict?: boolean;
  time_conflict_count?: number;
  city_insights?: CityInsightDto[];
  suggested_stops?: SuggestedStopDto[];
}
