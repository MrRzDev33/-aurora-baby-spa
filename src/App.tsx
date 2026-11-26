/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalendarView } from './components/calendar/CalendarView';
import { DashboardView } from './components/dashboard/DashboardView';
import { DataCategoryTab, DataView } from './components/data/DataView';
import { Header } from './components/layout/Header';
import { NavTab, Sidebar } from './components/layout/Sidebar';
import { DeleteConfirmationModal } from './components/modals/DeleteConfirmationModal';
import { JembolFormModal } from './components/modals/JembolFormModal';
import { JembolVisitDetailModal } from './components/modals/JembolVisitDetailModal';
import { NewDataChooserModal } from './components/modals/NewDataChooserModal';
import { ReservationDetailModal } from './components/modals/ReservationDetailModal';
import { ReservationFormModal } from './components/modals/ReservationFormModal';
import { VisitFormModal } from './components/modals/VisitFormModal';
import { ReservationListView } from './components/reservations/ReservationListView';
import { SettingsView } from './components/settings/SettingsView';
import { CategoryLegendPopup } from './components/ui/CategoryLegendPopup';
import { Toast, ToastMessage } from './components/ui/Toast';
import { useDatabase } from './hooks/useDatabase';
import {
  JembolRecord,
  Reservation,
  ReservationWithTreatment,
  VisitRecord,
} from './types';

export default function App() {
  const {
    reservations,
    treatments,
    activeTreatments,
    jembolRecords,
    visitRecords,
    missingJembolVisitTables,
    stats,
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
  } = useDatabase();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [dataInitialCategory, setDataInitialCategory] = useState<DataCategoryTab>('menu');
  const [dataNavSignal, setDataNavSignal] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // New Data Chooser Modal
  const [isNewDataChooserOpen, setIsNewDataChooserOpen] = useState(false);

  // Reservation modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<ReservationWithTreatment | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(undefined);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithTreatment | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<ReservationWithTreatment | null>(null);

  // Jembol modal states
  const [isJembolFormOpen, setIsJembolFormOpen] = useState(false);
  const [editingJembol, setEditingJembol] = useState<JembolRecord | null>(null);

  // Visit modal states
  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitRecord | null>(null);

  // Detail modal for Jembol / Visit
  const [jembolVisitDetailState, setJembolVisitDetailState] = useState<{
    isOpen: boolean;
    mode: 'jembol' | 'visit';
    jembolData?: JembolRecord | null;
    visitData?: VisitRecord | null;
  }>({ isOpen: false, mode: 'jembol' });

  // Delete confirmation for Jembol / Visit
  const [jembolToDelete, setJembolToDelete] = useState<JembolRecord | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<VisitRecord | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({
      id: String(Date.now()),
      type,
      text,
    });
  };

  // Global + New Data button handler
  const handleOpenNewDataChooser = () => {
    setIsNewDataChooserOpen(true);
  };

  // Handlers for New Reservation
  const handleOpenNewReservation = (dateStr?: string) => {
    setEditingReservation(null);
    setFormDefaultDate(dateStr);
    setIsFormOpen(true);
  };

  // Handlers for Viewing Detail Reservation
  const handleSelectReservation = (res: ReservationWithTreatment) => {
    setSelectedReservation(res);
    setIsDetailOpen(true);
  };

  // Handlers for Editing Reservation
  const handleStartEditReservation = (res: ReservationWithTreatment) => {
    setIsDetailOpen(false);
    setEditingReservation(res);
    setIsFormOpen(true);
  };

  // Handlers for Deleting Reservation
  const handleStartDeleteReservation = (res: ReservationWithTreatment) => {
    setIsDetailOpen(false);
    setJembolToDelete(null);
    setVisitToDelete(null);
    setReservationToDelete(res);
    setIsDeleteOpen(true);
  };

  // Handlers for Jembol
  const handleOpenNewJembol = () => {
    setEditingJembol(null);
    setIsJembolFormOpen(true);
  };

  const handleSelectJembol = (record: JembolRecord) => {
    setJembolVisitDetailState({
      isOpen: true,
      mode: 'jembol',
      jembolData: record,
      visitData: null,
    });
  };

  const handleStartEditJembol = (record: JembolRecord) => {
    setJembolVisitDetailState((prev) => ({ ...prev, isOpen: false }));
    setEditingJembol(record);
    setIsJembolFormOpen(true);
  };

  const handleStartDeleteJembol = (record: JembolRecord) => {
    setJembolVisitDetailState((prev) => ({ ...prev, isOpen: false }));
    setReservationToDelete(null);
    setVisitToDelete(null);
    setJembolToDelete(record);
    setIsDeleteOpen(true);
  };

  const handleJembolSubmit = async (
    data: Omit<JembolRecord, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingJembol) {
      await updateJembol(editingJembol.id, data);
      showToast('Data Jembol berhasil diperbarui.');
    } else {
      await createJembol(data);
      showToast('Data Jembol berhasil disimpan.');
    }
    setIsJembolFormOpen(false);
    setEditingJembol(null);
  };

  // Handlers for Visit
  const handleOpenNewVisit = () => {
    setEditingVisit(null);
    setIsVisitFormOpen(true);
  };

  const handleSelectVisit = (record: VisitRecord) => {
    setJembolVisitDetailState({
      isOpen: true,
      mode: 'visit',
      jembolData: null,
      visitData: record,
    });
  };

  const handleStartEditVisit = (record: VisitRecord) => {
    setJembolVisitDetailState((prev) => ({ ...prev, isOpen: false }));
    setEditingVisit(record);
    setIsVisitFormOpen(true);
  };

  const handleStartDeleteVisit = (record: VisitRecord) => {
    setJembolVisitDetailState((prev) => ({ ...prev, isOpen: false }));
    setReservationToDelete(null);
    setJembolToDelete(null);
    setVisitToDelete(record);
    setIsDeleteOpen(true);
  };

  const handleVisitSubmit = async (
    data: Omit<VisitRecord, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingVisit) {
      await updateVisit(editingVisit.id, data);
      showToast('Data Visit berhasil diperbarui.');
    } else {
      await createVisit(data);
      showToast('Data Visit berhasil disimpan.');
    }
    setIsVisitFormOpen(false);
    setEditingVisit(null);
  };

  // Unified Delete Confirm
  const handleConfirmDelete = async () => {
    try {
      if (reservationToDelete) {
        await deleteReservation(reservationToDelete.id);
        setReservationToDelete(null);
        setIsDeleteOpen(false);
        showToast('Reservation deleted.');
      } else if (jembolToDelete) {
        await deleteJembol(jembolToDelete.id);
        setJembolToDelete(null);
        setIsDeleteOpen(false);
        showToast('Data Jembol berhasil dihapus.');
      } else if (visitToDelete) {
        await deleteVisit(visitToDelete.id);
        setVisitToDelete(null);
        setIsDeleteOpen(false);
        showToast('Data Visit berhasil dihapus.');
      }
    } catch {
      showToast('Unable to connect to the database. Please try again.', 'error');
    }
  };

  // Reservation Form Submit handler
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
      throw err;
    }
  };

  const handleSelectNavTab = (tab: NavTab) => {
    if (tab === 'data') {
      setDataInitialCategory('menu');
      setDataNavSignal((n) => n + 1);
    }
    setCurrentTab(tab);
  };

  const navigateToData = (subTab: DataCategoryTab = 'menu') => {
    setDataInitialCategory(subTab);
    setDataNavSignal((n) => n + 1);
    setCurrentTab('data');
  };

  return (
    <div className="min-h-screen bg-white text-[#263746] flex flex-col md:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectNavTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenNewData={handleOpenNewDataChooser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FCFDFE]">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewData={handleOpenNewDataChooser}
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
              reservations={reservations}
              treatments={treatments}
              jembolRecords={jembolRecords}
              visitRecords={visitRecords}
              onOpenNewData={handleOpenNewDataChooser}
              onNavigateToCalendar={() => setCurrentTab('calendar')}
              onNavigateToReservations={() => setCurrentTab('reservations')}
              onNavigateToData={navigateToData}
              onSelectReservation={handleSelectReservation}
              onSelectJembol={handleSelectJembol}
              onSelectVisit={handleSelectVisit}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              reservations={reservations}
              onSelectReservation={handleSelectReservation}
              onOpenNewReservation={handleOpenNewDataChooser}
              onOpenNewReservationForDate={(dateStr) => handleOpenNewReservation(dateStr)}
            />
          )}

          {currentTab === 'reservations' && (
            <ReservationListView
              reservations={reservations}
              treatments={treatments}
              onOpenNewReservation={handleOpenNewDataChooser}
              onSelectReservation={handleSelectReservation}
              onEditReservation={handleStartEditReservation}
              onDeleteReservation={handleStartDeleteReservation}
            />
          )}

          {currentTab === 'data' && (
            <DataView
              reservations={reservations}
              jembolRecords={jembolRecords}
              visitRecords={visitRecords}
              missingTables={missingJembolVisitTables}
              initialCategory={dataInitialCategory}
              navSignal={dataNavSignal}
              onOpenNewJembol={handleOpenNewJembol}
              onOpenNewVisit={handleOpenNewVisit}
              onSelectReservation={handleSelectReservation}
              onSelectJembol={handleSelectJembol}
              onEditJembol={handleStartEditJembol}
              onDeleteJembol={handleStartDeleteJembol}
              onSelectVisit={handleSelectVisit}
              onEditVisit={handleStartEditVisit}
              onDeleteVisit={handleStartDeleteVisit}
              onNavigateToSettings={() => setCurrentTab('settings')}
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
      {/* 0. New Data Chooser Modal */}
      <NewDataChooserModal
        isOpen={isNewDataChooserOpen}
        onClose={() => setIsNewDataChooserOpen(false)}
        onChooseReservation={() => handleOpenNewReservation()}
        onChooseJembol={handleOpenNewJembol}
        onChooseVisit={handleOpenNewVisit}
      />

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

      {/* 2. Create/Edit Jembol Form Modal */}
      <JembolFormModal
        isOpen={isJembolFormOpen}
        initialData={editingJembol}
        activeTreatments={activeTreatments}
        onClose={() => {
          setIsJembolFormOpen(false);
          setEditingJembol(null);
        }}
        onSubmit={handleJembolSubmit}
      />

      {/* 3. Create/Edit Visit Form Modal */}
      <VisitFormModal
        isOpen={isVisitFormOpen}
        initialData={editingVisit}
        activeTreatments={activeTreatments}
        onClose={() => {
          setIsVisitFormOpen(false);
          setEditingVisit(null);
        }}
        onSubmit={handleVisitSubmit}
      />

      {/* 4. Reservation Detail Modal */}
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

      {/* 5. Jembol / Visit Detail Modal */}
      <JembolVisitDetailModal
        isOpen={jembolVisitDetailState.isOpen}
        mode={jembolVisitDetailState.mode}
        jembolData={jembolVisitDetailState.jembolData}
        visitData={jembolVisitDetailState.visitData}
        onClose={() =>
          setJembolVisitDetailState((prev) => ({ ...prev, isOpen: false }))
        }
        onEdit={() => {
          if (jembolVisitDetailState.mode === 'jembol' && jembolVisitDetailState.jembolData) {
            handleStartEditJembol(jembolVisitDetailState.jembolData);
          } else if (jembolVisitDetailState.mode === 'visit' && jembolVisitDetailState.visitData) {
            handleStartEditVisit(jembolVisitDetailState.visitData);
          }
        }}
        onDelete={() => {
          if (jembolVisitDetailState.mode === 'jembol' && jembolVisitDetailState.jembolData) {
            handleStartDeleteJembol(jembolVisitDetailState.jembolData);
          } else if (jembolVisitDetailState.mode === 'visit' && jembolVisitDetailState.visitData) {
            handleStartDeleteVisit(jembolVisitDetailState.visitData);
          }
        }}
      />

      {/* 6. Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        reservation={reservationToDelete}
        customTitle={
          jembolToDelete
            ? 'Hapus Data Jembol?'
            : visitToDelete
            ? 'Hapus Data Visit?'
            : undefined
        }
        customDescription={
          jembolToDelete
            ? `Data Jembol (${jembolToDelete.jembol_type}) atas nama "${jembolToDelete.nama || 'Tanpa Nama'}" akan dihapus permanen.`
            : visitToDelete
            ? `Data Visit atas nama "${visitToDelete.nama || 'Tanpa Nama'}" akan dihapus permanen.`
            : undefined
        }
        onClose={() => {
          setIsDeleteOpen(false);
          setReservationToDelete(null);
          setJembolToDelete(null);
          setVisitToDelete(null);
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
