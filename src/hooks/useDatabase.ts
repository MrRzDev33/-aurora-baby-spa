import { useCallback, useEffect, useState } from 'react';
import { jembolVisitService } from '../services/jembolVisitService';
import { reservationService } from '../services/reservationService';
import { getSupabaseCredentials } from '../services/supabase';
import {
  DashboardStats,
  JembolRecord,
  Reservation,
  ReservationWithTreatment,
  Treatment,
  VisitRecord,
} from '../types';

export function useDatabase() {
  const [reservations, setReservations] = useState<ReservationWithTreatment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [activeTreatments, setActiveTreatments] = useState<Treatment[]>([]);
  const [jembolRecords, setJembolRecords] = useState<JembolRecord[]>([]);
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>([]);
  const [missingJembolVisitTables, setMissingJembolVisitTables] = useState<{
    jembolTableMissing: boolean;
    visitTableMissing: boolean;
  }>({ jembolTableMissing: false, visitTableMissing: false });

  const [stats, setStats] = useState<DashboardStats>({
    todayCount: 0,
    thisWeekCount: 0,
    thisMonthCount: 0,
  });
  const [upcomingReservations, setUpcomingReservations] = useState<ReservationWithTreatment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading data...');
  const [connectionStatus, setConnectionStatus] = useState<{
    isConfigured: boolean;
    isConnected: boolean;
    isChecking?: boolean;
    error?: string;
  }>({
    isConfigured: getSupabaseCredentials().isConfigured,
    isConnected: false,
    isChecking: true,
  });

  const refreshData = useCallback(async (customMessage?: string) => {
    if (customMessage) {
      setLoadingMessage(customMessage);
      setLoading(true);
    }
    try {
      const [resList, trtList, jembolList, visitList] = await Promise.all([
        reservationService.getReservations(),
        reservationService.getTreatments(),
        jembolVisitService.getJembolRecords(),
        jembolVisitService.getVisitRecords(),
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
      setJembolRecords(jembolList);
      setVisitRecords(visitList);
      setMissingJembolVisitTables(jembolVisitService.getMissingTablesStatus());
      setStats(computedStats);
      setUpcomingReservations(upcoming);
    } catch (err) {
      console.error('Error refreshing data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) {
      setConnectionStatus({
        isConfigured: false,
        isConnected: false,
        isChecking: false,
        error: 'Konfigurasi database belum diatur.',
      });
      return;
    }

    setConnectionStatus((prev) => ({ ...prev, isChecking: true }));
    const res = await reservationService.checkConnection();
    setConnectionStatus({
      isConfigured: true,
      isConnected: res.isConnected,
      isChecking: false,
      error: res.error,
    });
  }, []);

  useEffect(() => {
    refreshData('Loading data...');
    checkConnection();

    const unsubscribeReservations = reservationService.subscribeToRealtime(() => {
      refreshData();
    });
    const unsubscribeJembolVisit = jembolVisitService.subscribeToRealtime(() => {
      refreshData();
    });

    return () => {
      unsubscribeReservations();
      unsubscribeJembolVisit();
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

  // CRUD for Jembol Records
  const createJembol = async (
    data: Omit<JembolRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<JembolRecord> => {
    setLoading(true);
    setLoadingMessage('Menyimpan data jembol...');
    try {
      const created = await jembolVisitService.createJembolRecord(data);
      await refreshData();
      return created;
    } finally {
      setLoading(false);
    }
  };

  const updateJembol = async (
    id: string,
    updates: Partial<Omit<JembolRecord, 'id' | 'created_at'>>
  ): Promise<JembolRecord> => {
    setLoading(true);
    setLoadingMessage('Memperbarui data jembol...');
    try {
      const updated = await jembolVisitService.updateJembolRecord(id, updates);
      await refreshData();
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const deleteJembol = async (id: string): Promise<boolean> => {
    setLoading(true);
    setLoadingMessage('Menghapus data jembol...');
    try {
      const success = await jembolVisitService.deleteJembolRecord(id);
      await refreshData();
      return success;
    } finally {
      setLoading(false);
    }
  };

  // CRUD for Visit Records
  const createVisit = async (
    data: Omit<VisitRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<VisitRecord> => {
    setLoading(true);
    setLoadingMessage('Menyimpan data visit...');
    try {
      const created = await jembolVisitService.createVisitRecord(data);
      await refreshData();
      return created;
    } finally {
      setLoading(false);
    }
  };

  const updateVisit = async (
    id: string,
    updates: Partial<Omit<VisitRecord, 'id' | 'created_at'>>
  ): Promise<VisitRecord> => {
    setLoading(true);
    setLoadingMessage('Memperbarui data visit...');
    try {
      const updated = await jembolVisitService.updateVisitRecord(id, updates);
      await refreshData();
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const deleteVisit = async (id: string): Promise<boolean> => {
    setLoading(true);
    setLoadingMessage('Menghapus data visit...');
    try {
      const success = await jembolVisitService.deleteVisitRecord(id);
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
    jembolRecords,
    visitRecords,
    missingJembolVisitTables,
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
    createJembol,
    updateJembol,
    deleteJembol,
    createVisit,
    updateVisit,
    deleteVisit,
    addTreatment,
    updateTreatment,
    toggleTreatmentActive,
    deleteTreatment,
    refreshData,
  };
}
