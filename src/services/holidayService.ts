// src/services/holidayService.ts
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { HolidayDTO } from "../types/holiday";
import { ResponseDTO } from "../types/api";

/**
 * Holiday service wrapper for API calls.
 * Uses the shared axiosInstance which already handles authentication
 */

const holidayService = {
  /**
   * Returns array of holidays. Backend may return plain array or ResponseDTO.
   */
  async getHolidays(from?: string, to?: string): Promise<HolidayDTO[]> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await axiosInstance.get<any>(API_ENDPOINTS.HOLIDAYS.GET_ALL, { params });
    if (res.data && typeof res.data === "object" && "data" in res.data && res.data.data !== undefined) {
      return res.data.data as HolidayDTO[];
    }
    return res.data as HolidayDTO[];
  },

  async createHoliday(payload: Partial<HolidayDTO>): Promise<HolidayDTO> {
    const res = await axiosInstance.post<ResponseDTO<HolidayDTO>>(API_ENDPOINTS.HOLIDAYS.CREATE, payload);
    return res.data?.data ?? (res.data as any);
  },

  async updateHoliday(holidayId: number, payload: Partial<HolidayDTO>): Promise<HolidayDTO> {
    const res = await axiosInstance.put<ResponseDTO<HolidayDTO>>(API_ENDPOINTS.HOLIDAYS.GET_ALL, payload, {
      params: { holidayId },
    });
    return res.data?.data ?? (res.data as any);
  },

  async deleteHoliday(holidayId: number): Promise<ResponseDTO<void>> {
    const res = await axiosInstance.delete<ResponseDTO<void>>(API_ENDPOINTS.HOLIDAYS.GET_ALL, {
      params: { holidayId },
    });
    return res.data ?? { status: "SUCCESS", message: "Deleted" };
  },
};

export default holidayService;
