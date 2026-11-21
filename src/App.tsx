/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalendarView } from './components/calendar/CalendarView';
import { DashboardView } from './components/dashboard/DashboardView';
import { Header } from './components/layout/Header';
import { NavTab, Sidebar } from './components/layout/Sidebar';
import { DeleteConfirmationModal } from './components/modals/DeleteConfirmationModal';
import { ReservationDetailModal } from './components/modals/ReservationDetailModal';
import { ReservationFormModal } from './components/modals/ReservationFormModal';
import { ReservationListView } from './components/reservations/ReservationListView';
import { SettingsView } from './components/settings/SettingsView';
import { CategoryLegendPopup } from './components/ui/CategoryLegendPopup';
import { Toast, ToastMessage } from './components/ui/Toast';
import { useDatabase } from './hooks/useDatabase';
import { Reservation, ReservationWithTreatment } from './types';

export default function App() {
  const {
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
  } = useDatabase();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<ReservationWithTreatment | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(undefined);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithTreatment | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<ReservationWithTreatment | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({
      id: String(Date.now()),
      type,
      text,
    });
  };

  // Handlers for New Reservation
  const handleOpenNewReservation = (dateStr?: string) => {
    setEditingReservation(null);
    setFormDefaultDate(dateStr);
    setIsFormOpen(true);
  };

  // Handlers for Viewing Detail
  const handleSelectReservation = (res: ReservationWithTreatment) => {
    setSelectedReservation(res);
    setIsDetailOpen(true);
  };

  // Handlers for Editing
  const handleStartEditReservation = (res: ReservationWithTreatment) => {
    setIsDetailOpen(false);
    setEditingReservation(res);
    setIsFormOpen(true);
  };

  // Handlers for Deleting
  const handleStartDeleteReservation = (res: ReservationWithTreatment) => {
    setIsDetailOpen(false);
    setReservationToDelete(res);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reservationToDelete) return;
    try {
      await deleteReservation(reservationToDelete.id);
      setIsDeleteOpen(false);
      setReservationToDelete(null);
      showToast('Reservation deleted.');
    } catch {
      showToast('Unable to connect to the database. Please try again.', 'error');
    }
  };

  // Form Submit handler (Async, handles Supabase insert/update)
  const handleFormSubmit = async (
    data: Omit<Reservation, 'id' | 'reservation_code' | 'created_at' | 'updated_at'>
  ) => {
    try {
      if (editingReservation) {
        await updateReservation(editingReservation.id, data);
        showToast('Reservation successfully updated.');
      } else {
        await createReservation(data);
        showToast('Reservation successfully created.');
      }
      setIsFormOpen(false);
      setEditingReservation(null);
    } catch (err) {
      // Re-throw so ReservationFormModal catches it, shows error and preserves form inputs
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#263746] flex flex-col md:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenNewReservation={() => handleOpenNewReservation()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FCFDFE]">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewReservation={() => handleOpenNewReservation()}
          onResetData={() => {
            refreshData('Memuat ulang data...');
            showToast('Data berhasil disegarkan dari database.');
          }}
          loading={loading}
          loadingMessage={loadingMessage}
          connectionStatus={connectionStatus}
        />

        {/* View Content */}
        <main
          className={`flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto ${
            currentTab === 'calendar' || currentTab === 'reservations'
              ? 'pb-36 md:pb-24'
              : 'pb-24 md:pb-8'
          }`}
        >
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              upcomingReservations={upcomingReservations}
              onOpenNewReservation={() => handleOpenNewReservation()}
              onNavigateToCalendar={() => setCurrentTab('calendar')}
              onSelectReservation={handleSelectReservation}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              reservations={reservations}
              onSelectReservation={handleSelectReservation}
              onOpenNewReservation={() => handleOpenNewReservation()}
              onOpenNewReservationForDate={(dateStr) => handleOpenNewReservation(dateStr)}
            />
          )}

          {currentTab === 'reservations' && (
            <ReservationListView
              reservations={reservations}
              treatments={treatments}
              onOpenNewReservation={() => handleOpenNewReservation()}
              onSelectReservation={handleSelectReservation}
              onEditReservation={handleStartEditReservation}
              onDeleteReservation={handleStartDeleteReservation}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              treatments={treatments}
              reservations={reservations}
              onAddTreatment={addTreatment}
              onUpdateTreatment={updateTreatment}
              onToggleTreatmentActive={toggleTreatmentActive}
              onDeleteTreatment={deleteTreatment}
              onClearAllReservations={clearAllReservations}
              onResetData={() => refreshData()}
              onShowToast={showToast}
              connectionStatus={connectionStatus}
              onRefreshData={() => refreshData()}
              onCheckConnection={checkConnection}
            />
          )}

          {/* Copyright Footer */}
          <footer className="mt-10 pt-5 border-t border-[#E4EBF0]/80 text-center text-xs text-[#647b8e]">
            <span>Copyright &copy; {new Date().getFullYear()} </span>
            <a
              href="https://mrreza.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#16567d] hover:text-[#4eafde] underline underline-offset-2 transition-colors"
            >
              Reza
            </a>
          </footer>
        </main>
      </div>

      {/* Modals */}
      {/* 1. Create/Edit Reservation Form Modal */}
      <ReservationFormModal
        isOpen={isFormOpen}
        initialData={editingReservation}
        defaultDate={formDefaultDate}
        activeTreatments={activeTreatments}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReservation(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* 2. Reservation Detail Modal */}
      <ReservationDetailModal
        reservation={selectedReservation}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedReservation(null);
        }}
        onEdit={handleStartEditReservation}
        onDelete={handleStartDeleteReservation}
      />

      {/* 3. Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        reservation={reservationToDelete}
        onClose={() => {
          setIsDeleteOpen(false);
          setReservationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Animated Floating Bottom-Left Category Legend Pop-up */}
      {(currentTab === 'calendar' || currentTab === 'reservations') && (
        <CategoryLegendPopup isSidebarCollapsed={isSidebarCollapsed} />
      )}

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
