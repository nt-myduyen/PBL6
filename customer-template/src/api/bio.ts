import { PostExperienceParams, EducationParams, AwardParams } from "./../types/bio";
import httpRequest from "../ultils/httpRequest";

export const createExperience = async (
  params: PostExperienceParams
): Promise<any> => httpRequest.post("/experience", params);

export const deleteExperience = async (id: string): Promise<any> =>
  httpRequest.delete<any>(`/experience/${id}`);

export const updateExperience = async (
  id: string,
  params: PostExperienceParams
): Promise<any> => httpRequest.patch<any>(`/experience/${id}`, params);

export const createEducation = async (params: EducationParams): Promise<any> =>
  httpRequest.post("/education", params);

export const deleteEducation = async (id: string): Promise<any> =>
  httpRequest.delete<any>(`/education/${id}`);

export const updateEducation = async (
  id: string,
  params: EducationParams
): Promise<any> => httpRequest.patch<any>(`/education/${id}`, params);

export const createAward = async (params: AwardParams): Promise<any> =>
  httpRequest.post("/award", params);

export const deleteAward = async (id: string): Promise<any> =>
  httpRequest.delete<any>(`/award/${id}`);

export const updateAward = async (
  id: string,
  params: AwardParams
): Promise<any> => httpRequest.patch<any>(`/award/${id}`, params);
