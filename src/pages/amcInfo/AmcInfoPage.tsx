// src/app/amc-info/page.tsx
'use client';

import * as React from 'react';
import { useMemo, useEffect, useState } from 'react';
// Import your custom API instance
import { api } from "@/lib/axios";
import { AmcInfo, AmcFormValues, EntityOption } from '@/types/amc';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AmcTable } from '@/components/amc-table';
import { AmcForm } from '@/components/amc-form';
import { useToast } from '@/toast/ToastProvider';
import { useSidebar } from '@/components/ui/sidebar';

interface PaginationMeta {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
// --- Configuration ---

const API_BASE_PATH = '/api/amcInfo';
const DEFAULT_PAGE_SIZE = 10;

export default function AmcInfoPage() {

    const toast = useToast()
    const [data, setData] = useState<AmcInfo[]>([]);
    const [dealers, setDealers] = useState<EntityOption[]>([]);
    const [customers, setCustomers] = useState<EntityOption[]>([]);

    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta>({
        totalRecords: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: DEFAULT_PAGE_SIZE,
    });
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingAmc, setEditingAmc] = useState<AmcInfo | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 1. DATA FETCHING (GET)
    const fetchData = React.useCallback(async (currentPage: number) => {
        setIsLoading(true);
        try {
            const [amcRes, dealerRes, customerRes] = await Promise.all([
                // Pass pagination parameters to the AMC list endpoint
                api.get<{ data: AmcInfo[]; meta: PaginationMeta }>(
                    `${API_BASE_PATH}?page=${currentPage}&limit=${DEFAULT_PAGE_SIZE}`
                ),
                api.get<EntityOption[]>(`${API_BASE_PATH}/dealers`),
                api.get<EntityOption[]>(`${API_BASE_PATH}/customers`),
            ]);

            const newEntryOption: EntityOption = { id: 'new', name: '[+ New Entry]' };

            setDealers([...dealerRes.data, newEntryOption]);
            setCustomers([...customerRes.data, newEntryOption]);

            // Update the main data and metadata state
            setData(amcRes.data.data);
            setMeta(amcRes.data.meta);
            setPage(amcRes.data.meta.currentPage); // Ensure state reflects the response page

        } catch (error) {
            console.error('Error fetching initial data:', error);
            const errorMessage = (error as any).response?.data?.message || (error as any).message || 'Failed to load portal data.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array means this function is stable


    useEffect(() => {
        fetchData(page);
    }, [page, fetchData]);


    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // Helper to find the database ID of an entity by its displayed name.
    const findOptionIdByName = (options: EntityOption[], name: string): string => {
        return options.find(o => o.name === name)?.id || '';
    };

    const handleEdit = (amc: AmcInfo) => {
        setEditingAmc(amc);
        setIsSheetOpen(true);
    };

    // 2. FORM SUBMISSION (CREATE/UPDATE - POST/PUT)
    const handleSubmit = async (formData: AmcFormValues) => {
        setIsSubmitting(true);
        const method = editingAmc ? 'PUT' : 'POST';
        const url = editingAmc
            ? `${API_BASE_PATH}/${editingAmc.id}`
            : API_BASE_PATH;

        try {
            await api({ method, url, data: formData });

            // Re-fetch dropdowns if a new entity was created
            if (formData.dealer === 'new' || formData.customer === 'new') {
                await Promise.all([
                    api.get<EntityOption[]>(`${API_BASE_PATH}/dealers`).then(res => {
                        const newEntryOption: EntityOption = { id: 'new', name: '[+ New Entry]' };
                        setDealers([...res.data, newEntryOption]);
                    }),
                    api.get<EntityOption[]>(`${API_BASE_PATH}/customers`).then(res => {
                        const newEntryOption: EntityOption = { id: 'new', name: '[+ New Entry]' };
                        setCustomers([...res.data, newEntryOption]);
                    }),
                ]);
            }

            // Instead of manually manipulating the 'data' state, we simply refresh the current view
            // This is safer and more reliable with pagination enabled.
            await fetchData(page);

            toast.success(`${editingAmc ? 'Updated' : 'Created'} AMC record successfully!`);

            setIsSheetOpen(false);
            setEditingAmc(null);

        } catch (error) {
            // ... (error handling remains the same)
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleSheetClose = (open: boolean) => {
        if (!open) {
            setEditingAmc(null);
            setIsSheetOpen(false);
        } else {
            setIsSheetOpen(true);
        }
    };

    // Prepare initial form state for editing
    const initialFormState: Partial<AmcFormValues> | undefined = useMemo(() => {
        if (!editingAmc) return undefined;

        // Map the table data back to the form structure using the dynamic lists
        return {
            dealer: findOptionIdByName(dealers, editingAmc.dealerName),
            customer: findOptionIdByName(customers, editingAmc.customerName),
            description: editingAmc.description,
            status: editingAmc.status,
            amcFrom: editingAmc.amcFrom,
            amcTo: editingAmc.amcTo,
            amcMonth: editingAmc.amcMonth,
            newDealerName: editingAmc.dealerName,
            newCustomerName: editingAmc.customerName,
        };
    }, [editingAmc, dealers, customers]);


    if (isLoading && data.length === 0) {
        return (
            <div className="container mx-auto py-10 text-center">
                <p className="text-xl font-medium text-sky-600">Loading data, please wait...</p>
            </div>
        );
    }
    const { state } = useSidebar()
    return (
        <div className={`py-4  ${state == "expanded" ? "lg:w-[90%]" : "lg:w-full"
            }`}>
            <header className="flex justify-between items-center mb-6">
                <p className="text-3xl font-bold">AMC Info</p>
                <Button
                    className="!bg-sky-500 hover:!bg-sky-600 !text-white shadow-md"
                    onClick={() => setIsSheetOpen(true)}
                >
                    + Add New AMC Info
                </Button>
            </header>

            {/* --- Data Table --- */}
            <div className="border rounded-lg shadow-sm">
                <AmcTable data={data} onEdit={handleEdit} meta={meta}
                    onPageChange={handlePageChange}
                    loading={isLoading} />
            </div>

            {/* --- Sheet for CRUD Form --- */}
            <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
                <SheetContent side="right" className="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingAmc ? `Edit AMC ID: ${editingAmc.id.substring(0, 8)}...` : 'Add New AMC Info'}
                        </SheetTitle>
                    </SheetHeader>

                    {/* Pass the actual options and handlers to the form */}
                    <AmcForm
                        initialData={initialFormState}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        dealerOptions={dealers}
                        customerOptions={customers}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}