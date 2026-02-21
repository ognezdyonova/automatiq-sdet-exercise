export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type GeocodeResponse = {
  status: string;
  error_message?: string;
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
};
