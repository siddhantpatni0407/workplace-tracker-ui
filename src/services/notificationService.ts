// src/services/notificationService.ts
import axios, { AxiosInstance } from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/app";
import { HolidayDTO } from "../types/holiday";
import { Leave } from "../models/Leave";
import { DateUtils } from "../utils/date";
import { LeaveStatus, LeaveType, LeaveTypeLabels } from "../enums/LeaveEnums";

/**
 * Notification service for fetching upcoming events like holidays and approved leaves
 */
const client: AxiosInstance = axios.create({
  baseURL: "", // endpoints in API_ENDPOINTS contain full URL
  timeout: 15000,
});

// Attach token automatically (if present)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    if (!config.headers) {
      config.headers = { Authorization: `Bearer ${token}` } as any;
    } else {
      const h: any = config.headers;
      if (typeof h.set === "function") {
        h.set("Authorization", `Bearer ${token}`);
      } else {
        (config.headers as Record<string, string | number | boolean>)["Authorization"] = `Bearer ${token}`;
      }
    }
  }
  return config;
});

export interface UpcomingEvent {
  id: number;
  date: string; // ISO format date string (YYYY-MM-DD)
  name: string;
  type: "HOLIDAY" | "LEAVE";
  category: string; // Holiday type or leave type
  daysUntil: number;
}

/**
 * Fetches upcoming holidays and leaves for the next X days
 * @param userId User ID to fetch leaves for
 * @param days Number of days to look ahead (default: 30)
 * @returns Array of upcoming events sorted by date
 */
const getUpcomingEvents = async (userId: number, days: number = 30): Promise<UpcomingEvent[]> => {
  try {
    // Calculate date range
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    const fromDate = DateUtils.formatForApi(today);
    const toDate = DateUtils.formatForApi(endDate);
    
    console.log(`Current date: ${today.toISOString().split('T')[0]}`);
    console.log(`Fetching events from ${fromDate} to ${toDate}`);
    console.log(`Looking ahead ${days} days`);
    
    // Fetch holidays
    const holidaysPromise = client.get<any>(API_ENDPOINTS.HOLIDAYS.GET_ALL, {
      params: { from: fromDate, to: toDate }
    });
    
    // Fetch all leaves for the user (not filtering by approval status)
    const leavesPromise = client.get<any>(API_ENDPOINTS.USER_LEAVES.GET_BY_USER(userId));
    
    // Wait for both promises to resolve
    const [holidaysRes, leavesRes] = await Promise.all([holidaysPromise, leavesPromise]);
    
    // Process holidays
    let holidays: HolidayDTO[] = [];
    if (holidaysRes.data) {
      if (typeof holidaysRes.data === "object" && "data" in holidaysRes.data) {
        holidays = holidaysRes.data.data as HolidayDTO[];
      } else {
        holidays = holidaysRes.data as HolidayDTO[];
      }
    }
    
    // Process leaves
    let leaves: Leave[] = [];
    if (leavesRes.data) {
      if (typeof leavesRes.data === "object" && "data" in leavesRes.data) {
        leaves = leavesRes.data.data as Leave[];
      } else {
        leaves = leavesRes.data as Leave[];
      }
      
      // Debug the leave data structure
      console.log('Raw leave data received:', leaves);
      if (leaves.length > 0) {
        console.log('Sample leave object fields:', Object.keys(leaves[0]));
        console.log('Sample leave startDate:', leaves[0].startDate);
        console.log('Sample leave reason:', leaves[0].reason);
      }
    }
    
    // Filter leaves only by date range, ignoring approval status
    const approvedLeaves = leaves.filter(leave => {
      // Check if the leave falls within our date range
      const startDate = new Date(leave.startDate);
      if (isNaN(startDate.getTime())) {
        console.log(`Leave ${leave.leaveId} has invalid date: ${leave.startDate}`);
        return false; // Invalid date
      }
      
      // Set hours to 0 for accurate date comparison
      startDate.setHours(0, 0, 0, 0);
      
      // Check if the start date is in the future and within our range
      const isInRange = startDate >= today && startDate <= endDate;
      
      console.log(`Leave ${leave.leaveId || 'new'} (${leave.startDate}): isInRange=${isInRange}, today=${today.toISOString().split('T')[0]}, endDate=${endDate.toISOString().split('T')[0]}`);
      
      return isInRange;
    });
    
    console.log(`Found ${holidays.length} holidays and ${approvedLeaves.length} leaves in date range`);
    console.log('Upcoming leaves:', JSON.stringify(approvedLeaves, null, 2));
    
    // Convert holidays to unified format
    const holidayEvents: UpcomingEvent[] = holidays.map(holiday => {
      const eventDate = new Date(holiday.holidayDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate days until this event
      const diffTime = eventDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        id: holiday.holidayId || 0,
        date: holiday.holidayDate,
        name: holiday.name,
        type: "HOLIDAY" as const,
        category: holiday.holidayType,
        daysUntil
      };
    });
    
    // Convert leaves to unified format
    const leaveEvents: UpcomingEvent[] = approvedLeaves.map(leave => {
      const startDate = new Date(leave.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate days until this event
      const diffTime = startDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Use the notes/reason field for the display name to match the UI
      let displayName: string;
      
      // Based on your screenshot, the "notes" column appears to be "reason" in our data model
      if (leave.reason && leave.reason.trim() !== '') {
        displayName = leave.reason;
      } else {
        // If no reason is available, use a generic name
        displayName = "Personal Leave";
      }

      // We'll keep the display name simple as shown in your screenshot
      return {
        id: leave.leaveId || 0,
        date: leave.startDate,
        name: displayName,
        type: "LEAVE" as const,
        category: "LEAVE", // Fixed category since leaveType might be undefined
        daysUntil
      };
    });
    
    console.log(`Processed ${holidayEvents.length} holiday events and ${leaveEvents.length} leave events`);
    
    // Combine all events and sort by date (closest first)
    const allEvents = [...holidayEvents, ...leaveEvents].sort((a, b) => a.daysUntil - b.daysUntil);
    
    return allEvents;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }
};

const notificationService = {
  getUpcomingEvents
};

export default notificationService;