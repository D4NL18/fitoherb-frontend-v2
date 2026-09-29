export interface ScheduledRouteReq {
  routeDate: string; // yyyy-MM-dd
  departureTime?: string;
  returnToDepot: boolean;
  depot: any; // LocationPointDto
  stops: any[]; // DeliveryStopDto[]
  optimizationResult?: any; // OptimizeRouteResponse
}

export interface ScheduledRouteRes {
  id: string;
  routeDate: string; // yyyy-MM-dd
  departureTime: string;
  returnToDepot: boolean;
  depot: any;
  stops: any[];
  optimizationResult: any;
  totalTimeMinutes: number;
  totalDistanceKm: number;
  stopsCount: number;
  createdAt: string;
}

export interface ScheduledRouteSummaryRes {
  id: string;
  routeDate: string;
  departureTime: string;
  stopsCount: number;
  totalTimeMinutes: number;
  totalDistanceKm: number;
}
