"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getDonors } from "../../services/donorService"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { Pagination } from "../ui/pagination"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function DonorList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // React Query for donors
  const { data, isLoading, isError } = useQuery({
    queryKey: ["donors", page, limit, searchTerm],
    queryFn: () => getDonors({ page, limit, search: searchTerm }),
    keepPreviousData: true,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const getDonorTypeColor = (type) => {
    switch (type) {
      case "MONEY":
        return "bg-green-100 text-green-800"
      case "FOOD":
        return "bg-blue-100 text-blue-800"
      case "BOTH":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading donors...</div>
  }

  if (isError) {
    return <div className="text-red-500 p-8">Error loading donors</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Donors</h2>
        <Button onClick={() => navigate("/donors/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Donor
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Donations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.donors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No donors found
                </TableCell>
              </TableRow>
            ) : (
              data?.donors.map((donor) => (
                <motion.tr
                  key={donor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-b"
                >
                  <TableCell className="font-medium">{donor.name}</TableCell>
                  <TableCell>{donor.email}</TableCell>
                  <TableCell>
                    <Badge className={getDonorTypeColor(donor.type)}>{donor.type}</Badge>
                  </TableCell>
                  <TableCell>{donor._count?.donations || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/donors/${donor.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                        onClick={() => navigate(`/donors/${donor.id}/delete`)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.pagination && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
