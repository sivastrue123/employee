// src/app/amc-info/page.tsx
'use client';

import * as React from 'react';
import { AmcInfo, AmcFormValues, MOCK_DATA, MOCK_DEALERS, MOCK_CUSTOMERS, EntityOption } from '@/types/amc';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AmcTable } from '@/components/amc-table';
import { AmcForm } from '@/components/amc-form';
import { useToast } from '@/toast/ToastProvider';
import { useMemo } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export default function AmcInfoPage() {
    const [data, setData] = React.useState<AmcInfo[]>(MOCK_DATA);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [editingAmc, setEditingAmc] = React.useState<AmcInfo | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const toast = useToast();
    const { state } = useSidebar();
    // STATE FOR DYNAMIC DROPDOWNS
    const [dealers, setDealers] = React.useState<EntityOption[]>(MOCK_DEALERS);
    const [customers, setCustomers] = React.useState<EntityOption[]>(MOCK_CUSTOMERS);

    // Helper to find the actual option by name (needed for pre-populating edit form)
    const findOptionIdByName = (options: EntityOption[], name: string): string => {
        return options.find(o => o.name === name)?.id || '';
    };

    const handleEdit = (amc: AmcInfo) => {
        setEditingAmc(amc);
        setIsSheetOpen(true);
    };

    // Helper to manage new entity creation and state update
    const createNewEntity = (type: 'dealer' | 'customer', name: string) => {
        // In a real app, this would be an API call (POST /dealers, POST /customers)
        const newId = `${type[0]}${Date.now()}`;
        const newEntity: EntityOption = { id: newId, name: name };

        const setEntities = type === 'dealer' ? setDealers : setCustomers;

        setEntities(prev => {
            // Filter out the '[+ New Entry]' option
            const existingEntities = prev.filter(e => e.id !== 'new');
            // Find the '[+ New Entry]' option to re-add it at the end
            const newEntryOption = prev.find(e => e.id === 'new')!;

            // Add the new entity and then the '[+ New Entry]' option
            return [...existingEntities, newEntity, newEntryOption];
        });

        return newId; // Return the new entity ID
    };

    const handleSubmit = async (formData: AmcFormValues) => {
        setIsSubmitting(true);
        try {
            let finalDealerId = formData.dealer;
            let finalCustomerId = formData.customer;

            // 1. Handle New Dealer Creation
            if (formData.dealer === 'new' && formData.newDealerName) {
                finalDealerId = createNewEntity('dealer', formData.newDealerName);
                toast.info(`Created new dealer: ${formData.newDealerName}`);
            }

            // 2. Handle New Customer Creation
            if (formData.customer === 'new' && formData.newCustomerName) {
                finalCustomerId = createNewEntity('customer', formData.newCustomerName);
                toast.info(`Created new customer: ${formData.newCustomerName}`);
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. Create/Update the AMC Record
            const newRecord: AmcInfo = {
                id: editingAmc?.id || `a${Date.now()}`,
                // Look up the actual name from the current state (dealers/customers)
                dealerName: dealers.find(d => d.id === finalDealerId)?.name || (formData.newDealerName || 'Error: Dealer Name Missing'),
                customerName: customers.find(c => c.id === finalCustomerId)?.name || (formData.newCustomerName || 'Error: Customer Name Missing'),
                description: formData.description,
                status: formData.status,
                amcFrom: formData.amcFrom,
                amcTo: formData.amcTo,
                amcMonth: formData.amcMonth,
            };

            if (editingAmc) {
                // UPDATE logic
                setData(prev => prev.map(a => (a.id === newRecord.id ? newRecord : a)));
                toast.success(`AMC ID ${newRecord.id} updated successfully!`);
            } else {
                // CREATE logic
                setData(prev => [newRecord, ...prev]);
                toast.success('New AMC record created successfully!');
            }

            setIsSheetOpen(false);
            setEditingAmc(null);
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Failed to save AMC info. Please try again.');
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

    // Use useMemo to prevent unnecessary recalculation of initialFormState
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
        };
    }, [editingAmc, dealers, customers]);


    return (
        <div className={`${state == "expanded" ? "lg:w-[90%]" : "lg:w-full"
            } py-10`}>
            <header className="flex justify-between items-center mb-6">
                <p className="text-3xl font-bold">AMC Info</p>
                <Button
                    className="!bg-sky-500 hover:!bg-sky-600 !text-white shadow-md"
                    onClick={() => setIsSheetOpen(true)}
                >
                    +  Add New AMC Info
                </Button>
            </header>


            <div className="border rounded-lg shadow-sm">
                <AmcTable data={data} onEdit={handleEdit} />
            </div>

            <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
                <SheetContent side="right" className="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle >
                            {editingAmc ? 'Edit AMC Info' : 'Add New AMC Info'}
                        </SheetTitle>

                    </SheetHeader>

                    <AmcForm
                        initialData={initialFormState}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        dealerOptions={dealers} // Passed dynamic list
                        customerOptions={customers} // Passed dynamic list
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}