import { useCallback, useEffect, useState } from 'react';
import { reservationService } from '../services/reservationService';
import { getSupabaseCredentials } from '../services/supabase';
import {
  DashboardStats,
  Reservation,
  ReservationWithTreatment,
  Treatment,
} from '../types';

export function useDatabase() {
  const [reservations, setReservations] = useState<ReservationWithTreatment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [activeTreatments, setActiveTreatments] = useState<Treatment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayCount: 0,
    thisWeekCount: 0,
    thisMonthCount: 0,
  });
  const [upcomingReservations, setUpcomingReservations] = useState<ReservationWithTreatment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading reservations...');
  const [connectionStatus, setConnectionStatus] = useState<{
    isConfigured: boolean;
    isConnected: boolean;
    error?: string;
  }>({
    isConfigured: false,
    isConnected: false,
  });

  const refreshData = useCallback(async (customMessage?: string) => {
    if (customMessage) {
      setLoadingMessage(customMessage);
      setLoading(true);
    }
    try {
      // Fetch concurrently from Supabase data access layer
      const [resList, trtList] = await Promise.all([
        reservationService.getReservations(),
        reservationService.getTreatments(),
      ]);

      const activeTrt = trtList.filter((t) => t.is_active);
      const computedStats = reservationService.getDashboardStatistics(resList);

      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = resList
        .filter((r) => r.reservation_date >= todayStr)
        .sort((a, b) => {
          if (a.reservation_date !== b.reservation_date) {
            return a.reservation_date.localeCompare(b.reservation_date);
          }
          return a.reservation_time.localeCompare(b.reservation_time);
        })
        .slice(0, 6);

      setReservations(resList);
      setTreatments(trtList);
      setActiveTreatments(activeTrt);
      setStats(computedStats);
      setUpcomingReservations(upcoming);
    } catch (err) {
      console.error('Error refreshing data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check connection to Supabase
  const checkConnection = useCallback(async () => {
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) {
      setConnectionStatus({
        isConfigured: false,
        isConnected: false,
      });
      return;
    }

    const res = await reservationService.checkConnection();
    setConnectionStatus({
      isConfigured: true,
      isConnected: res.isConnected,
      error: res.error,
    });
  }, []);

  useEffect(() => {
    refreshData('Loading calendar & reservations...');
    checkConnection();

    // Subscribe to Supabase Realtime changes
    const unsubscribeRealtime = reservationService.subscribeToRealtime(() => {
      refreshData();
    });

    return () => {
      unsubscribeRealtime();
    };
  }, [refreshData, checkConnection]);

  // CRUD for Reservations
  const createReservation = async (
    data: Omit<Reservation, 'id' | 'reservation_code' | 'created_at' | 'updated_at'>
  ): Promise<ReservationWithTreatment> => {
    setLoading(true);
    setLoadingMessage('Saving reservation...');
    try {
      const created = await reservationService.createReservation(data);
      await refreshData();
      return created;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReservation = async (
    id: string,
    updates: Partial<Omit<Reservation, 'id' | 'reservation_code' | 'created_at'>>
  ): Promise<ReservationWithTreatment> => {
    setLoading(true);
    setLoadingMessage('Updating reservation...');
    try {
      const updated = await reservationService.updateReservation(id, updates);
      await refreshData();
      return updated;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReservation = async (id: string): Promise<boolean> => {
    setLoading(true);
    setLoadingMessage('Deleting reservation...');
    try {
      const success = await reservationService.deleteReservation(id);
      await refreshData();
      return success;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearAllReservations = async (): Promise<boolean> => {
    setLoading(true);
    setLoadingMessage('Clearing all reservations...');
    try {
      const success = await reservationService.clearAllReservations();
      await refreshData();
      return success;
    } finally {
      setLoading(false);
    }
  };

  // CRUD for Treatments
  const addTreatment = async (name: string): Promise<Treatment> => {
    setLoading(true);
    setLoadingMessage('Saving treatment...');
    try {
      const trt = await reservationService.createTreatment(name);
      await refreshData();
      return trt;
    } finally {
      setLoading(false);
    }
  };

  const updateTreatment = async (id: string, name: string): Promise<Treatment> => {
    setLoading(true);
    setLoadingMessage('Updating treatment...');
    try {
      const trt = await reservationService.updateTreatment(id, name);
      await refreshData();
      return trt;
    } finally {
      setLoading(false);
    }
  };

  const toggleTreatmentActive = async (id: string, currentActive: boolean): Promise<Treatment> => {
    setLoading(true);
    setLoadingMessage('Updating treatment status...');
    try {
      const trt = await reservationService.toggleTreatmentActive(id, currentActive);
      await refreshData();
      return trt;
    } finally {
      setLoading(false);
    }
  };

  const deleteTreatment = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setLoadingMessage('Removing treatment...');
    try {
      const res = await reservationService.deleteTreatment(id);
      if (res.success) {
        await refreshData();
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    reservations,
    treatments,
    activeTreatments,
    stats,
    upcomingReservations,
    loading,
    loadingMessage,
    connectionStatus,
    checkConnection,
    createReservation,
    updateReservation,
    deleteReservation,
    clearAllReservations,
    addTreatment,
    updateTreatment,
    toggleTreatmentActive,
    deleteTreatment,
    refreshData,
  };
}
