export type ConsultationRequestType = "haircut" | "beard" | "both";
export interface StyleRecommendation {
  styleName: string;
  explanation: string;
  barberInstructions: string;
  previewImage?: string;
  previewStatus?: "generated" | "unavailable";
}
export interface AiConsultation {
  consultationType: ConsultationRequestType;
  haircutRecommendations: StyleRecommendation[];
  beardRecommendations: StyleRecommendation[];
  maintenanceTips: string[];
  disclaimer: string;
}
export interface AiConsultationResponseData {
  consultation: AiConsultation;
}
