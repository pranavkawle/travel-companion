export interface UserProfile {
  id: string;
  first_name: string;
  mobile_verified: boolean;
  languages_spoken: string[];
  is_blocked: boolean;
  notification_opt_out: boolean;
  created_at: string;
}

export interface RegisterRequest {
  first_name: string;
  languages_spoken: string[];
}

export interface UpdateUserRequest {
  first_name?: string;
  languages_spoken?: string[];
  notification_opt_out?: boolean;
}

export interface Post {
  id: string;
  poster_id: string;
  post_type: string;
  poster_is_traveller: boolean;
  traveller_relationship?: string;
  origin_iata: string;
  final_destination_iata: string;
  travel_date: string;
  languages_needed: string[];
  languages_spoken: string[];
  notes: string;
  is_active: boolean;
  created_at: string;
  segments: PostSegment[];
}

export interface PostSegment {
  id?: string;
  segment_order: number;
  flight_number: string;
  airline: string;
  origin_iata: string;
  destination_iata: string;
  departure_time: string;
  arrival_time: string;
}

export interface CreatePostRequest {
  post_type: string;
  poster_is_traveller: boolean;
  traveller_relationship?: string;
  origin_iata: string;
  final_destination_iata: string;
  travel_date: string;
  languages_needed: string[];
  languages_spoken: string[];
  notes: string;
  segments: PostSegment[];
}

export interface Connection {
  id: string;
  initiator_id: string;
  post_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: string;
  connection_id: string;
  participant_a_id: string;
  participant_b_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  sent_at: string;
}

export interface Airport {
  iata_code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export interface Flight {
  flight_number: string;
  airline: string;
  origin_iata: string;
  destination_iata: string;
  departure_time: string;
  arrival_time: string;
}

export interface TravellerDetails {
  id: string;
  shared_by_user_id: string;
  traveller_name: string;
  notes?: string;
  created_at: string;
}

export interface FlaggedUser {
  id: string;
  first_name: string;
  report_count: number;
  created_at: string;
}

export interface BlockedUser {
  id: string;
  first_name: string;
  blocked_at: string;
}

export interface ReportDto {
  id: string;
  reporter_id: string;
  reason: string;
  created_at: string;
  dismissed_at?: string;
}
