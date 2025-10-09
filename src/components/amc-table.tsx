// src/components/amc-table.tsx
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AmcInfo, AmcStatus } from '@/types/amc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

interface AmcTableProps {
    data: AmcInfo[];
    onEdit: (amc: AmcInfo) => void;
}

const StatusBadge = ({ status }: { status: AmcStatus }) => {
    let className = 'bg-gray-500 hover:bg-gray-500';
    if (status === 'Active') className = 'bg-green-500 hover:bg-green-500';
    if (status === 'Extension') className = 'bg-yellow-500 hover:bg-yellow-500';

    return <Badge className={`text-white ${className}`}>{status}</Badge>;
};


export const amcColumns: ColumnDef<AmcInfo>[] = [
    {
        accessorKey: 'dealerName',
        header: 'Dealer',
    },
    {
        accessorKey: 'customerName',
        header: 'Customer',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        accessorKey: 'amcFrom',
        header: 'From',
    },
    {
        accessorKey: 'amcTo',
        header: 'To',
    },
    {
        accessorKey: 'amcMonth',
        header: 'Month',
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
            <span className="truncate max-w-xs block text-sm text-gray-500">
                {row.original.description}
            </span>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row, table }) => {
            // Access the onEdit function passed via the table meta property
            const { onEdit } = table.options.meta as { onEdit: (amc: AmcInfo) => void };
            return (
                <Button
                    variant="ghost"
                    onClick={() => onEdit(row.original)}
                    className="h-8 w-8 p-0"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            );
        },
    },
];

export function AmcTable({ data, onEdit }: AmcTableProps) {
    return (
        <DataTable
            columns={amcColumns}
            data={data}
            meta={{ onEdit }}
        />
    );
}