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
}

export interface OptimizeRouteRequest {
  depot: LocationPointDto;
  stops: DeliveryStopDto[];
  return_to_depot?: boolean;
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
}

export interface OptimizeRouteResponse {
  total_time_minutes: number;
  total_distance_km: number;
  stops_count: number;
  ordered_stops: OrderedStopDto[];
  geojson_geometry: any;
  fitness_history: number[];
}
