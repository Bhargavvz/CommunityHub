import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Filter,
  ChevronUp,
  ChevronDown,
  Users,
  UserPlus
} from 'lucide-react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface Resident {
  id: string;
  name: string;
  unit: string;
  phone: string;
  email: string;
  moveInDate: string;
}

const residents: Resident[] = [
  {
    id: '1',
    name: 'John Smith',
    unit: 'A-101',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    moveInDate: '2023-06-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    unit: 'B-205',
    phone: '(555) 234-5678',
    email: 'sarah.j@email.com',
    moveInDate: '2023-08-22',
  },
  {
    id: '3',
    name: 'Michael Brown',
    unit: 'C-304',
    phone: '(555) 345-6789',
    email: 'michael.b@email.com',
    moveInDate: '2023-11-30',
  },
];

const columnHelper = createColumnHelper<Resident>();

export default function Directory() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const columns = React.useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <div className="font-medium text-text-primary">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor('unit', {
      header: 'Unit',
      cell: info => (
        <div className="flex items-center text-text-secondary">
          <MapPin className="h-4 w-4 text-primary/70 mr-2 flex-shrink-0" />
          {info.getValue()}
        </div>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: info => (
        <div className="flex items-center text-text-secondary">
          <Phone className="h-4 w-4 text-primary/70 mr-2 flex-shrink-0" />
          {info.getValue()} 
        </div>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => (
        <div className="flex items-center text-text-secondary">
          <Mail className="h-4 w-4 text-primary/70 mr-2 flex-shrink-0" />
          <span className="truncate" title={info.getValue()}>{info.getValue()}</span> 
        </div>
      ),
      enableSorting: false,
    }),
  ], []);

  const table = useReactTable({
    data: residents,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary/30 backdrop-blur-md border border-glass-border shadow-lg rounded-glass p-8 mb-12 md:flex md:items-center md:justify-between relative overflow-hidden"
      >
        {/* Background elements for visual interest */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent/10 rounded-full blur-xl"></div>
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-primary/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-heading text-white">Resident Directory</h1>
          <p className="mt-2 text-sm text-gray-100">Connect and communicate with your neighbors at Eastern Green Homes.</p>
        </div>

        {isAdmin && (
          <div className="mt-4 relative z-10 md:mt-0 md:ml-4">
            <motion.button 
              type="button"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center px-5 py-2.5 bg-accent text-primary rounded-lg shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition gap-2 font-medium"
            >
              <UserPlus size={18} />
              Add Resident
            </motion.button>
          </div>
        )}
      </motion.div>

      <h2 className="text-2xl font-heading font-semibold text-primary mb-6">Community Members</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/70 backdrop-blur-sm rounded-xl border border-glass-border shadow-md overflow-hidden mb-8"
      >
        <div className="p-5 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, unit, etc..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="ml-2">
                          {header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-4 w-4 text-secondary" />
                          ) : header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-4 w-4 text-secondary" />
                          ) : header.column.getCanSort() ? (
                            <ChevronUp className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                          ) : null}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-text-secondary">
                    No residents found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="text-center text-gray-500 text-sm">
        <p>This directory includes all current residents at Eastern Green Homes.</p>
        <p className="mt-1">Contact information is only visible to registered community members.</p>
      </div>
    </div>
  );
}