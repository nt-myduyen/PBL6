import httpRequest from "../ultils/httpRequest";
import { SearchParams } from "../types/mentor";

export const getMentors = async (params: SearchParams): Promise<any> =>
  httpRequest.get<any>("/mentors", { params });

export const getAllMentors = async (): Promise<any> =>
  httpRequest.get<any>("/mentor");

export const getSearchMentor = async (name: String): Promise<any> =>
  httpRequest.get<any>(`/mentor/search?name=${name}`);
